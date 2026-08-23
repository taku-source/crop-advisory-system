const AgriculturalKnowledge = require('../models/AgriculturalKnowledge');
const SoilData = require('../models/SoilData');
const DiseaseKnowledge = require('../models/DiseaseKnowledge');
const CropProgress = require('../models/CropProgress');

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
        cropName: new RegExp(`^${String(farmer.primaryCrop).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'),
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
      const currentStage = this.determineCropStage(farmer.plantingDate, cropKnowledge);
      const daysToPlanting = this.daysUntilOptimalPlanting(cropKnowledge);

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
        season: this.getCurrentSeason(cropKnowledge),
        farmerContext: {
          location: farmer.location,
          soilType: farmer.soilType,
          farmingSystem: 'Rain-fed seasonal farming',
          farmSize: farmer.farmSize
        },
        currentStatus: {
          stage: currentStage,
          plantingDate: farmer.plantingDate,
          daysToOptimalPlanting: daysToPlanting,
          message: this.getStageMessage(currentStage, daysToPlanting, cropKnowledge)
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
  determineCropStage(plantingDate, cropKnowledge) {
    if (!plantingDate) {
      return 'pre-planting';
    }

    const planted = new Date(plantingDate);
    const today = new Date();
    const daysAfterPlanting = Math.floor((today - planted) / (1000 * 60 * 60 * 24));

    if (daysAfterPlanting < 0) return 'pre-planting';
    const stages = (cropKnowledge?.growthStages || []).filter((stage) => Number.isFinite(stage.daysAfterPlanting));
    if (!stages.length) {
      return cropKnowledge?.growthStages?.[0]?.stageName?.toLowerCase() || 'unknown';
    }
    const current = stages.find((stage, index) => {
      const next = stages[index + 1];
      return daysAfterPlanting >= stage.daysAfterPlanting && (!next || daysAfterPlanting < next.daysAfterPlanting);
    });
    return current?.stageName?.toLowerCase() || stages[stages.length - 1].stageName.toLowerCase();
  }

  /**
   * Calculate days until optimal planting window
   */
  daysUntilOptimalPlanting(cropKnowledge) {
    const startMonth = cropKnowledge?.plantingWindow?.startMonth;
    if (!startMonth) return null;
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const monthsUntil = (startMonth - currentMonth + 12) % 12;
    return monthsUntil * 30;
  }

  /**
   * Get current message based on stage
   */
  getStageMessage(stage, daysToPlanting, cropKnowledge) {
    if (stage === 'pre-planting') {
      return `Planting window guidance: ${cropKnowledge?.plantingPeriod || 'see verified crop guidance'}. Prepare the field and confirm effective rainfall and soil moisture.`;
    }
    const current = (cropKnowledge?.growthStages || []).find((item) => item.stageName?.toLowerCase() === stage.toLowerCase());
    const actions = (current?.activities || []).map((item) => item.activityName).filter(Boolean);
    return actions.length ? `${current.stageName}: ${actions.join('; ')}.` : `${stage}: follow the verified crop stage guidance.`;
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
        description: `Forecast rainfall for the next 7 days: ${this.getForecastRainfall(weatherData).toFixed(1)}mm. Monitor soil moisture and drought stress.`,
        reason: 'Based on current weather conditions at your location',
        source: (weatherData.sources || ['NASA POWER', 'Open-Meteo Forecast API']).join(' + ')
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
          prevention: d.preventiveMeasures,
          treatment: d.managementMeasures,
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

  getForecastRainfall(weatherData) {
    return (weatherData?.forecast?.data || []).reduce((sum, day) => sum + (day.precipitation?.mm || 0), 0);
  }

  /**
   * Get stage-specific pest/disease alerts
   */
  getStageSpecificAlerts(stage) {
    return `Review verified disease and pest guidance for the ${stage} stage and scout the crop regularly.`;
  }

  /**
   * Get current season
   */
  getCurrentSeason(cropKnowledge) {
    return `Rain-fed seasonal guidance; verified planting period: ${cropKnowledge?.plantingPeriod || 'not specified'}`;
  }
}

module.exports = SeasonalPlanGenerator;
