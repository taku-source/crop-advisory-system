const AgriculturalKnowledge = require('../models/AgriculturalKnowledge');
const SoilData = require('../models/SoilData');
const DiseaseKnowledge = require('../models/Disease');
const CropProgress = require('../models/CropProgress');
const { getSupportedCropNames } = require('../config/supportedCrops');

/**
 * Generate a seasonal crop plan for a farmer
 * Combines agricultural knowledge, soil data, weather, and farmer context
 */
class SeasonalPlanGenerator {
  async generateSeasonalPlans(farmer, weatherData = null) {
    const cropNames = farmer.primaryCrops?.length ? farmer.primaryCrops : [farmer.primaryCrop];
    const plans = [];

    for (const cropName of cropNames.filter(Boolean).slice(0, 3)) {
      plans.push(await this.generateSeasonalPlan({ ...(farmer.toObject?.() || farmer), primaryCrop: cropName }, weatherData));
    }

    return {
      ...(plans[0] || {}),
      crops: cropNames,
      plans
    };
  }

  /**
   * Generate full seasonal plan for farmer's selected crop
   * @param {Object} farmer - User/farmer object
   * @param {Object} weatherData - Current weather data from NASA POWER
   * @returns {Object} - Complete seasonal plan
   */
  async generateSeasonalPlan(farmer, weatherData = null) {
    try {
      // Get agricultural knowledge for the crop
      const cropKnowledge = await AgriculturalKnowledge.findOne({
        $or: getSupportedCropNames(farmer.primaryCrop).map((name) => ({ cropName: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') })),
        agroEcologicalRegion: 'III',
        isActive: true
      });

      if (!cropKnowledge) {
        throw new Error(`No agricultural knowledge available for ${farmer.primaryCrop}`);
      }

      // Get soil-specific information
      let soilInfo = null;
      if (farmer.soilType) {
        soilInfo = await SoilData.findOne({
          soilType: { $regex: farmer.soilType, $options: 'i' },
          isActive: true
        });
      }

      // Determine current stage
      const currentStage = this.determineCropStage(farmer.plantingDate);
      const daysToPlanting = this.daysUntilOptimalPlanting(farmer.primaryCrop);

      // Build seasonal timeline
      const seasonalTimeline = this.buildSeasonalTimeline(
        cropKnowledge,
        farmer,
        soilInfo,
        weatherData
      );
      const completedProgress = await CropProgress.find({
        userId: farmer._id,
        crop: farmer.primaryCrop
      }).lean();
      const completedStageIds = new Set(completedProgress.map((item) => item.stageId));
      seasonalTimeline.forEach((stage) => { stage.completed = completedStageIds.has(stage.stageId); });

      // Get current actions
      const currentActions = this.getCurrentActions(
        currentStage,
        cropKnowledge,
        farmer,
        soilInfo,
        weatherData
      );

      // Get disease and pest management info
      const diseaseManagement = await this.getDiseasePestManagement(
        farmer.primaryCrop,
        currentStage
      );

      // Build the complete plan
      const seasonalPlan = {
        crop: farmer.primaryCrop,
        region: 'Agro-Ecological Region III',
        season: this.getCurrentSeason(),
        farmerContext: {
          location: farmer.location,
          soilType: farmer.soilType,
          irrigationMethod: farmer.irrigationMethod,
          farmSize: farmer.farmSize
        },
        currentStatus: {
          stage: currentStage,
          plantingDate: farmer.plantingDate,
          daysToOptimalPlanting: daysToPlanting,
          message: this.getStageMessage(currentStage, daysToPlanting)
        },
        currentActions: currentActions,
        seasonalTimeline: seasonalTimeline,
        cropGuidance: {
          planting: cropKnowledge.plantingDetails,
          fertilizer: cropKnowledge.fertiliserRecs || [],
          weedManagement: cropKnowledge.weedManagement,
          pests: cropKnowledge.pestKnowledge || [],
          sourceIds: cropKnowledge.sourceIds || [],
          datasetName: cropKnowledge.datasetName || '',
          datasetVersion: cropKnowledge.datasetVersion || ''
        },
        diseaseAndPestManagement: diseaseManagement,
        references: {
          agriculturalKnowledge: cropKnowledge.source || 'Agricultural Knowledge Base',
          agriculturalReference: cropKnowledge.reference || null,
          soilData: soilInfo ? soilInfo.source : null,
          soilReference: soilInfo ? soilInfo.reference : null,
          weatherData: weatherData ? 'NASA POWER Climate API' : null
        }
      };

      return seasonalPlan;
    } catch (error) {
      console.error('Error generating seasonal plan:', error);
      throw error;
    }
  }

  /**
   * Determine current crop stage
   */
  determineCropStage(plantingDate) {
    if (!plantingDate) {
      return 'pre-planting';
    }

    const planted = new Date(plantingDate);
    const today = new Date();
    const daysAfterPlanting = Math.floor((today - planted) / (1000 * 60 * 60 * 24));

    if (daysAfterPlanting < 0) return 'pre-planting';
    if (daysAfterPlanting < 14) return 'seedling';
    if (daysAfterPlanting < 45) return 'vegetative';
    if (daysAfterPlanting < 75) return 'flowering';
    if (daysAfterPlanting < 120) return 'grain_fill';
    return 'mature';
  }

  /**
   * Calculate days until optimal planting window
   */
  daysUntilOptimalPlanting(crop) {
    const today = new Date();
    const month = today.getMonth() + 1;

    // Region III optimal planting: November-December for most crops
    if (month >= 11 || month <= 1) {
      return 0; // Within planting window
    }
    if (month < 11) {
      return 31 * (11 - month);
    }
    return 0;
  }

  /**
   * Get current message based on stage
   */
  getStageMessage(stage, daysToPlanting) {
    const messages = {
      'pre-planting': `Planting window approaching. Prepare field and ensure adequate soil moisture. 
                       Recommended planting period: November-December.`,
      'seedling': 'Seeds are germinating. Monitor soil moisture and watch for pest damage.',
      'vegetative': 'Plant is in vegetative growth stage. Focus on weed management and nutrient supply.',
      'flowering': 'Plant is flowering. Critical stage for disease and pest management.',
      'grain_fill': 'Grain/fruit is developing. Maintain adequate water and monitor for late-season pests.',
      'mature': 'Crop is mature. Prepare for harvest.'
    };
    return messages[stage] || 'Monitor crop regularly.';
  }

  /**
   * Build seasonal timeline
   */
  buildSeasonalTimeline(cropKnowledge, farmer, soilInfo, weatherData) {
    const timeline = [];
    const stages = cropKnowledge.growthStages || [];

    for (const stage of stages) {
      const timelineEntry = {
        stageId: `${stage.stageName || 'stage'}-${timeline.length + 1}`.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        stage: stage.stageName,
        daysAfterPlanting: stage.daysAfterPlanting || 'Variable',
        description: stage.description || `Complete the ${stage.stageName || 'crop'} activities at the recommended time.`,
        activities: stage.activities || [],
        soilConsiderations: soilInfo ? this.getSoilConsiderations(soilInfo, stage.stageName) : null,
        commonIssues: stage.commonIssues || [],
        source: cropKnowledge.source || 'Agricultural Knowledge Base'
      };

      timeline.push(timelineEntry);
    }

    return timeline;
  }

  /**
   * Get soil-specific considerations
   */
  getSoilConsiderations(soilInfo, stage) {
    if (!soilInfo.managementPractices) return null;

    const stagePractices = soilInfo.managementPractices.filter(p =>
      p.timing && p.timing.toLowerCase().includes(stage.toLowerCase())
    );

    return stagePractices.length > 0 ? stagePractices : null;
  }

  /**
   * Get current actions for farmer
   */
  getCurrentActions(currentStage, cropKnowledge, farmer, soilInfo, weatherData) {
    const actions = [];

    // Get activities for current stage
    const stageAliases = {
      'pre-planting': ['pre-planting', 'land preparation', 'planting'],
      seedling: ['seedling', 'emergence-2-weeks', 'establishment'],
      vegetative: ['vegetative', '3-6-weeks', 'vegetative-tasseling', 'flowering/pegging'],
      flowering: ['flowering', 'flowering/pegging', 'vegetative-tasseling', 'tasseling-grain-fill'],
      grain_fill: ['grain_fill', 'grain fill', 'pod filling', 'tasseling-grain-fill'],
      mature: ['mature', 'maturity', 'harvest', 'harvest-storage']
    };
    const acceptedStages = stageAliases[currentStage] || [currentStage];
    const stage = (cropKnowledge.growthStages || []).find(
      s => acceptedStages.includes(s.stageName.toLowerCase())
    );

    if (stage && stage.activities) {
      for (const activity of stage.activities) {
        actions.push({
          priority: activity.priority || 'medium',
          activity: activity.activityName,
          description: activity.description,
          timing: activity.timing,
          reason: `Recommended for ${stage.stageName} stage`,
          source: cropKnowledge.source || 'Agricultural Knowledge Base'
        });
      }
    }

    // Add soil-specific actions
    if (soilInfo && soilInfo.managementPractices) {
      const soilActions = soilInfo.managementPractices.filter(p =>
        p.timing && p.timing.toLowerCase().includes(currentStage.toLowerCase())
      );

      for (const action of soilActions) {
        actions.push({
          priority: action.priority || 'medium',
          activity: action.practice,
          description: action.description,
          reason: `Specific to ${farmer.soilType} soil`,
          source: soilInfo.source || 'Soil Knowledge Base'
        });
      }
    }

    // Add weather-based actions
    if (weatherData && currentStage === 'vegetative') {
      actions.push({
        priority: 'high',
        activity: 'Weather Monitoring',
        description: `Current rainfall: ${weatherData.rainfall || 'N/A'}mm. Monitor for drought stress.`,
        reason: 'Based on current weather conditions at your location',
        source: 'NASA POWER Climate API'
      });
    }

    return actions;
  }

  /**
   * Get disease and pest management recommendations
   */
  async getDiseasePestManagement(cropName, currentStage) {
    try {
      const diseases = await DiseaseKnowledge.find({
        crop: { $regex: cropName, $options: 'i' },
        isActive: true
      }).limit(5);

      const management = {
        preventiveMeasures: [
          'Practice crop rotation to break pest/disease cycles',
          'Use disease-resistant varieties when available',
          'Maintain adequate spacing for air circulation',
          'Scout fields regularly (2-3 times per week)',
          'Remove infected plants promptly'
        ],
        commonDiseases: diseases.map(d => ({
          name: d.diseaseName,
          symptoms: d.symptoms,
          prevention: d.prevention,
          treatment: d.treatment,
          severity: d.severity
        })),
        stageSpecificAlerts: this.getStageSpecificAlerts(currentStage),
        source: 'Integrated Pest Management Knowledge Base'
      };

      return management;
    } catch (error) {
      console.error('Error fetching disease management:', error);
      return null;
    }
  }

  /**
   * Get stage-specific pest/disease alerts
   */
  getStageSpecificAlerts(stage) {
    const alerts = {
      'germination': 'Watch for cutworms and seedling damping off.',
      'vegetative': 'Monitor for aphids, armyworms, and leaf spot diseases.',
      'flowering': 'Critical stage. Monitor intensively for pests and fungal diseases.',
      'grain_fill': 'Watch for late-season insect pests and grain rot diseases.',
      'mature': 'Monitor for storage pests if grain will be stored.'
    };
    return alerts[stage] || 'Monitor regularly.';
  }

  /**
   * Get current season
   */
  getCurrentSeason() {
    const month = new Date().getMonth() + 1;
    if (month >= 11 || month <= 3) {
      return '2025/26 Main Season';
    }
    return 'Off-season';
  }
}

module.exports = SeasonalPlanGenerator;
