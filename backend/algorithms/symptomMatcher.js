const DiseaseKnowledge = require('../models/DiseaseKnowledge');

class SymptomMatcher {
  /**
   * Match farmer-observed symptoms against disease knowledge base
   * @param {Array} farmerSymptoms - Array of symptom strings selected/described by farmer
   * @param {String} crop - Crop name
   * @returns {Array} - Ranked diseases with match scores
   */
  async matchSymptoms(farmerSymptoms, crop) {
    try {
      if (!farmerSymptoms || farmerSymptoms.length === 0) {
        throw new Error('At least one symptom must be provided');
      }

      if (!crop) {
        throw new Error('Crop name must be provided');
      }

      // Get all diseases for the specified crop
      const diseases = await DiseaseKnowledge.find({
        crop: { $regex: crop, $options: 'i' },
        isActive: true
      });

      if (diseases.length === 0) {
        return [];
      }

      // Calculate match scores for each disease
      const matchedDiseases = diseases.map(disease => {
        const matchResult = this.calculateMatchScore(farmerSymptoms, disease);
        return {
          disease: disease,
          matchResult: matchResult
        };
      });

      // Sort by match score (highest first)
      matchedDiseases.sort((a, b) => b.matchResult.score - a.matchResult.score);

      // Format results for response
      return this.formatResults(matchedDiseases);
    } catch (error) {
      console.error('Error matching symptoms:', error.message);
      throw error;
    }
  }

  /**
   * Calculate weighted match score for a disease
   * Formula: Match Score = Σ(weight of matched symptom) / Σ(weight of all disease symptoms) × 100
   * @param {Array} farmerSymptoms
   * @param {Object} disease
   * @returns {Object} - Match result with score and details
   */
  calculateMatchScore(farmerSymptoms, disease) {
    if (!disease.symptoms || disease.symptoms.length === 0) {
      return {
        score: 0,
        matchedSymptoms: [],
        unmatchedSymptoms: [],
        totalSymptomWeight: 0
      };
    }

    let totalDiseaseWeight = 0;
    let totalMatchedWeight = 0;
    const matchedSymptoms = [];
    const unmatchedSymptoms = [];

    // Normalize farmer symptoms to lowercase for comparison
    const normalizedFarmerSymptoms = farmerSymptoms.map(s => s.toLowerCase().trim());

    // Calculate weights
    for (const diseaseSymptom of disease.symptoms) {
      const symptomName = diseaseSymptom.symptom.toLowerCase().trim();
      const weight = diseaseSymptom.weight || 5;  // Default weight if not specified

      totalDiseaseWeight += weight;

      // Check if this disease symptom matches any farmer symptom
      const isFuzzyMatch = this.fuzzyMatch(symptomName, normalizedFarmerSymptoms);

      if (isFuzzyMatch) {
        totalMatchedWeight += weight;
        matchedSymptoms.push({
          symptom: diseaseSymptom.symptom,
          weight: weight,
          description: diseaseSymptom.description
        });
      } else {
        unmatchedSymptoms.push({
          symptom: diseaseSymptom.symptom,
          weight: weight
        });
      }
    }

    // Calculate match score as percentage
    const score = totalDiseaseWeight > 0 
      ? (totalMatchedWeight / totalDiseaseWeight) * 100 
      : 0;

    return {
      score: Math.round(score * 10) / 10,  // Round to 1 decimal place
      matchedSymptoms: matchedSymptoms,
      unmatchedSymptoms: unmatchedSymptoms,
      totalSymptomWeight: totalDiseaseWeight,
      matchedWeight: totalMatchedWeight,
      matchPercentage: `${matchedSymptoms.length}/${disease.symptoms.length}`
    };
  }

  /**
   * Fuzzy matching for symptom comparison
   * Accounts for slight variations in symptom naming
   * @param {String} diseaseSymptom
   * @param {Array} farmerSymptoms
   * @returns {Boolean}
   */
  fuzzyMatch(diseaseSymptom, farmerSymptoms) {
    // Exact match
    if (farmerSymptoms.includes(diseaseSymptom)) {
      return true;
    }

    // Partial/fuzzy match
    for (const farmerSymptom of farmerSymptoms) {
      // Check if one contains the other (fuzzy match)
      if (diseaseSymptom.includes(farmerSymptom) || farmerSymptom.includes(diseaseSymptom)) {
        return true;
      }

      // Levenshtein distance for minor spelling variations
      if (this.levenshteinDistance(diseaseSymptom, farmerSymptom) <= 2) {
        return true;
      }
    }

    return false;
  }

  /**
   * Calculate Levenshtein distance between two strings
   * Measures similarity accounting for character insertions, deletions, substitutions
   * @param {String} str1
   * @param {String} str2
   * @returns {Number}
   */
  levenshteinDistance(str1, str2) {
    const len1 = str1.length;
    const len2 = str2.length;
    const matrix = [];

    // Initialize matrix
    for (let i = 0; i <= len1; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= len2; j++) {
      matrix[0][j] = j;
    }

    // Fill matrix
    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,      // Deletion
          matrix[i][j - 1] + 1,      // Insertion
          matrix[i - 1][j - 1] + cost // Substitution
        );
      }
    }

    return matrix[len1][len2];
  }

  /**
   * Format matched diseases for API response
   * @param {Array} matchedDiseases
   * @returns {Array}
   */
  formatResults(matchedDiseases) {
    return matchedDiseases.map(item => {
      const disease = item.disease;
      const match = item.matchResult;

      return {
        id: disease._id,
        diseaseName: disease.diseaseName,
        crop: disease.crop,
        
        // Match information
        matchScore: match.score,
        matchPercentage: match.matchPercentage,
        confidence: this.getConfidenceLevel(match.score),
        
        // Matched symptoms
        matchedSymptoms: match.matchedSymptoms.map(s => ({
          symptom: s.symptom,
          description: s.description,
          weight: s.weight
        })),
        
        // Additional disease information
        causativeAgent: disease.causativeAgent,
        severity: disease.severity,
        
        // Management information
        management: {
          preventiveMeasures: (disease.preventiveMeasures || []).map(m => ({
            measure: m.measure,
            description: m.description
          })),
          treatmentMeasures: (disease.managementMeasures || []).map(m => ({
            measure: m.measure,
            description: m.description,
            timing: m.timing
          }))
        },
        
        // Additional details
        description: disease.description || '',
        favourableConditions: disease.favourableConditions || [],
        yieldLoss: disease.yield_loss,
        imageUrl: disease.imageUrl,
        source: disease.source || 'Disease Knowledge Base'
      };
    });
  }

  /**
   * Determine confidence level based on match score
   * @param {Number} score
   * @returns {String}
   */
  getConfidenceLevel(score) {
    if (score >= 80) return 'High';
    if (score >= 60) return 'Medium';
    if (score >= 40) return 'Low';
    return 'Very Low';
  }

  /**
   * Get disease information (without matching)
   * Used when farmer selects a disease from a list
   * @param {String} diseaseId
   * @returns {Object}
   */
  async getDiseaseInfo(diseaseId) {
    try {
      const disease = await DiseaseKnowledge.findById(diseaseId);
      if (!disease) {
        throw new Error('Disease not found');
      }

      return {
        id: disease._id,
        diseaseName: disease.diseaseName,
        crop: disease.crop,
        description: disease.description,
        causativeAgent: disease.causativeAgent,
        symptoms: disease.symptoms,
        favourableConditions: disease.favourableConditions,
        severity: disease.severity,
        causes: disease.causes,
        preventiveMeasures: disease.preventiveMeasures,
        managementMeasures: disease.managementMeasures,
        yield_loss: disease.yield_loss,
        imageUrl: disease.imageUrl,
        source: disease.source
      };
    } catch (error) {
      console.error('Error getting disease info:', error.message);
      throw error;
    }
  }

  /**
   * Get all symptoms for a crop
   * Used to populate symptom selection interface
   * @param {String} crop
   * @returns {Array}
   */
  async getCropSymptoms(crop) {
    try {
      const diseases = await DiseaseKnowledge.find({
        crop: { $regex: crop, $options: 'i' },
        isActive: true
      });

      const symptomsSet = new Set();

      diseases.forEach(disease => {
        (disease.symptoms || []).forEach(s => {
          symptomsSet.add(s.symptom);
        });
      });

      return Array.from(symptomsSet).sort();
    } catch (error) {
      console.error('Error getting crop symptoms:', error.message);
      throw error;
    }
  }
}

module.exports = new SymptomMatcher();
