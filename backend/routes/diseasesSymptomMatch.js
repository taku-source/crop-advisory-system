const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const symptoMatcher = require('../algorithms/symptomMatcher');
const DiseaseKnowledge = require('../models/DiseaseKnowledge');

/**
 * POST /api/diseases/match-symptoms
 * Match farmer symptoms to diseases using weighted symptom matching algorithm
 * Body: { symptoms: ['symptom1', 'symptom2', ...], crop: 'crop_name' }
 */
router.post('/match-symptoms', protect, async (req, res) => {
  try {
    const { symptoms, crop } = req.body;

    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one symptom'
      });
    }

    if (!crop) {
      return res.status(400).json({
        success: false,
        message: 'Crop name is required'
      });
    }

    // Match symptoms using weighted algorithm
    const matchedDiseases = await symptoMatcher.matchSymptoms(symptoms, crop);

    res.json({
      success: true,
      farmerSymptoms: symptoms,
      crop: crop,
      resultCount: matchedDiseases.length,
      data: matchedDiseases
    });
  } catch (error) {
    console.error('Error matching symptoms:', error);
    res.status(500).json({
      success: false,
      message: `Error matching symptoms: ${error.message}`
    });
  }
});

/**
 * GET /api/diseases/symptoms/:crop
 * Get all symptoms for a crop (for building symptom selection interface)
 */
router.get('/symptoms/:crop', protect, async (req, res) => {
  try {
    const crop = req.params.crop;

    if (!crop) {
      return res.status(400).json({
        success: false,
        message: 'Crop name is required'
      });
    }

    const symptoms = await symptoMatcher.getCropSymptoms(crop);

    res.json({
      success: true,
      crop: crop,
      symptomCount: symptoms.length,
      data: symptoms
    });
  } catch (error) {
    console.error('Error fetching symptoms:', error);
    res.status(500).json({
      success: false,
      message: `Error fetching symptoms: ${error.message}`
    });
  }
});

/**
 * GET /api/diseases/identify/:diseaseId
 * Get detailed information for a specific disease
 */
router.get('/identify/:diseaseId', protect, async (req, res) => {
  try {
    const diseaseId = req.params.diseaseId;

    const diseaseInfo = await symptoMatcher.getDiseaseInfo(diseaseId);

    res.json({
      success: true,
      data: diseaseInfo
    });
  } catch (error) {
    console.error('Error fetching disease info:', error);
    res.status(500).json({
      success: false,
      message: `Error fetching disease information: ${error.message}`
    });
  }
});

/**
 * GET /api/diseases/crop/:crop
 * Get all diseases for a crop
 */
router.get('/crop/:crop', protect, async (req, res) => {
  try {
    const crop = req.params.crop;

    const diseases = await DiseaseKnowledge.find({
      crop: { $regex: crop, $options: 'i' },
      isActive: true
    }).select('diseaseName description severity symptoms');

    res.json({
      success: true,
      crop: crop,
      count: diseases.length,
      data: diseases
    });
  } catch (error) {
    console.error('Error fetching diseases:', error);
    res.status(500).json({
      success: false,
      message: `Error fetching diseases: ${error.message}`
    });
  }
});

module.exports = router;
