const AgriculturalKnowledge = require('../models/AgriculturalKnowledge');
const SoilData = require('../models/SoilData');
const Advisory = require('../models/Advisory');
const nasaPowerService = require('../services/nasaPowerService');
const { isSupportedCrop } = require('../config/supportedCrops');

class AdvisoryRuleEngine {
  /**
   * Generate contextual advisories for a farmer based on their profile and environmental conditions
   * @param {Object} farmer - Farmer object with location, crop, soil, stage, etc.
   * @returns {Array} - Array of contextual advisories with reasoning
   */
  async generateContextualAdvisories(farmer) {
    try {
      // Validate farmer has required fields
      if (!(farmer.primaryCrop || farmer.primaryCrops?.[0])) {
        throw new Error('Farmer must have a primary crop selected');
      }
      if (!isSupportedCrop(farmer.primaryCrop || farmer.primaryCrops[0])) {
        throw new Error('Farmer crop is outside the supported seven-crop scope');
      }

      // Step 1: Get agricultural knowledge for farmer's crop
      const cropKnowledge = await this.getCropKnowledge(farmer.primaryCrop || farmer.primaryCrops[0], 'III');
      if (!cropKnowledge) {
        return [];  // No knowledge available for this crop
      }

      // Step 2: Determine current crop stage and timing
      const currentStage = this.determineCropStage(farmer, cropKnowledge);

      // Step 3: Get weather data if farmer has location
      let weatherData = null;
      if (farmer.location && farmer.location.latitude && farmer.location.longitude) {
        try {
          weatherData = await nasaPowerService.getContextWeatherData(
            farmer.location.latitude,
            farmer.location.longitude
          );
        } catch (error) {
          console.warn('Could not fetch weather data:', error.message);
        }
      }

      // Step 4: Apply decision rules
      const advisories = await this.applyDecisionRules(
        farmer,
        cropKnowledge,
        currentStage,
        weatherData
      );

      return advisories;
    } catch (error) {
      console.error('Error generating contextual advisories:', error.message);
      throw error;
    }
  }

  /**
   * Get agricultural knowledge for a specific crop
   * @param {String} cropName
   * @param {String} region - Agro-ecological region
   * @returns {Object}
   */
  async getCropKnowledge(cropName, region = 'III') {
    return await AgriculturalKnowledge.findOne({
      cropName: { $regex: cropName, $options: 'i' },
      agroEcologicalRegion: region,
      isActive: true
    });
  }

  /**
   * Determine current crop stage based on planting date
   * @param {Object} farmer
   * @returns {String} - Current growth stage
   */
  determineCropStage(farmer, cropKnowledge) {
    if (!farmer.plantingDate) {
      return 'unknown';
    }

    const plantingDate = new Date(farmer.plantingDate);
    const today = new Date();
    const daysAfterPlanting = Math.floor((today - plantingDate) / (1000 * 60 * 60 * 24));

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
   * Apply decision rules to generate advisories
   * @param {Object} farmer
   * @param {Object} cropKnowledge
   * @param {String} currentStage
   * @param {Object} weatherData
   * @returns {Array} - Advisories matching farmer context
   */
  async applyDecisionRules(farmer, cropKnowledge, currentStage, weatherData) {
    const advisories = [];

    // Rule 1: Stage-based activities
    const stageActivities = this.getStageActivities(cropKnowledge, currentStage);
    for (const activity of stageActivities) {
      const advisory = {
        crop: farmer.primaryCrop,
        activity: activity.activityName,
        description: activity.description,
        timing: activity.timing,
        contextualReason: `${currentStage.charAt(0).toUpperCase() + currentStage.slice(1)} stage - recommended activity for ${farmer.primaryCrop}`,
        source: cropKnowledge.source || 'Agricultural Knowledge Base'
      };
      advisories.push(advisory);
    }

    // Rule 2: Fertiliser recommendations based on stage
    if (currentStage === 'vegetative' || currentStage === 'flowering') {
      const fertiliserRecs = cropKnowledge.fertiliserRecs || [];
      for (const rec of fertiliserRecs) {
        if (rec.timing && rec.timing.toLowerCase().includes(currentStage)) {
          const advisory = {
            crop: farmer.primaryCrop,
            activity: `Fertiliser Application - ${rec.type}`,
            description: `Apply ${rec.rateKgPerHa} kg/ha of ${rec.type}. ${rec.description}`,
            contextualReason: `Recommended for ${currentStage} stage. Apply at ${rec.timing}.`,
            source: cropKnowledge.source || 'Agricultural Knowledge Base'
          };
          advisories.push(advisory);
        }
      }
    }

    // Rule 3: Soil-specific recommendations
    if (farmer.soilType) {
      const soilAdvisories = await this.getSoilSpecificAdvisories(
        farmer.soilType,
        farmer.primaryCrop || farmer.primaryCrops[0],
        currentStage
      );
      advisories.push(...soilAdvisories);
    }

    // Rule 4: Weather-based recommendations
    if (weatherData) {
      const weatherAdvisories = this.getWeatherBasedAdvisories(
        weatherData,
        farmer.primaryCrop,
        currentStage
      );
      advisories.push(...weatherAdvisories);
    }

    // Rule 5: Pest and disease prevention (especially important in certain stages)
    if (currentStage === 'vegetative' || currentStage === 'flowering') {
      const pestAdvisories = this.getPestDiseaseAdvisories(cropKnowledge, currentStage);
      advisories.push(...pestAdvisories);
    }

    advisories.push(...await this.getConfiguredAdvisories(
      farmer,
      currentStage,
      weatherData
    ));

    return advisories;
  }

  async getConfiguredAdvisories(farmer, currentStage, weatherData) {
    const crop = farmer.primaryCrop || farmer.primaryCrops?.[0];
    const configured = await Advisory.find({
      crop: { $regex: `^${crop.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, $options: 'i' },
      region: 'III',
      isActive: true
    }).lean();
    const weatherText = this.getWeatherCondition(weatherData);

    const stageAliases = {
      'pre-planting': ['pre-planting', 'land preparation', 'planting'],
      seedling: ['seedling', 'establishment', 'germination'],
      vegetative: ['vegetative'],
      flowering: ['flowering'],
      grain_fill: ['grain / pod formation', 'grain/pod formation', 'grain fill', 'maturity'],
      mature: ['maturity', 'harvesting', 'harvest']
    };
    const acceptedStages = stageAliases[currentStage] || [currentStage];

    return configured.filter((rule) => {
      const stage = (rule.cropStage || '').toLowerCase();
      const soil = (rule.soilType || '').toLowerCase();
      const requestedWeather = (rule.weatherCondition || '').toLowerCase();
      return (!stage || stage === 'any stage' || acceptedStages.includes(stage)) &&
        (!soil || soil === 'any soil' || soil.includes((farmer.soilType || '').toLowerCase())) &&
        (!requestedWeather || requestedWeather === 'any condition' || weatherText.includes(requestedWeather));
    }).map((rule) => ({
      crop,
      activity: rule.activity,
      description: `${rule.description}${rule.instructions ? ` ${rule.instructions}` : ''}`,
      timing: rule.recommendedDate ? new Date(rule.recommendedDate).toISOString().split('T')[0] : rule.cropStage || 'As conditions indicate',
      contextualReason: rule.contextualReason || rule.triggerCondition || 'Matched the administrator-configured contextual rule.',
      source: rule.source || rule.sourceInformation?.source || 'Administrator-configured advisory rule',
      reference: rule.reference || rule.sourceInformation?.reference || ''
    }));
  }

  getWeatherCondition(weatherData) {
    const forecast = weatherData?.forecast?.data || [];
    const rainfall = forecast.reduce((sum, day) => sum + (day.precipitation?.mm || 0), 0);
    if (rainfall >= 20) return 'rainfall expected adequate soil moisture';
    if (rainfall <= 5) return 'dry spell expected low rainfall';
    return 'any condition';
  }

  /**
   * Get activities for specific crop stage
   * @param {Object} cropKnowledge
   * @param {String} stageName
   * @returns {Array}
   */
  getStageActivities(cropKnowledge, stageName) {
    const stageAliases = {
      seedling: ['seedling', 'germination', 'emergence-2-weeks', 'establishment'],
      germination: ['seedling', 'germination', 'emergence-2-weeks', 'establishment'],
      vegetative: ['vegetative', '3-6-weeks', 'vegetative-tasseling'],
      flowering: ['flowering', 'reproductive', 'vegetative-tasseling', 'tasseling-grain-fill'],
      grain_fill: ['grain_fill', 'grain fill', 'tasseling-grain-fill', 'grainorpodformation'],
      mature: ['mature', 'maturity', 'harvest', 'harvest-storage', 'harvesting'],
      establishment: ['establishment', 'germination', 'seedling'],
      grainorpodformation: ['grainorpodformation', 'grain fill', 'pod filling', 'maturity']
    };
    const acceptedNames = stageAliases[stageName.toLowerCase()] || [stageName.toLowerCase()];
    const stage = (cropKnowledge.growthStages || []).find(
      s => acceptedNames.includes(s.stageName.toLowerCase())
    );
    return stage ? stage.activities : [];
  }

  /**
   * Get soil-specific recommendations
   * @param {String} soilType
   * @param {String} crop
   * @param {String} stage
   * @returns {Array}
   */
  async getSoilSpecificAdvisories(soilType, crop, stage) {
    try {
      const soilData = await SoilData.findOne({
        soilType: { $regex: soilType, $options: 'i' },
        suitableCrops: { $in: [crop] },
        isActive: true
      });

      if (!soilData) {
        return [];
      }

      const advisories = [];

      // Check if soil has management practices
      if (soilData.managementPractices) {
        for (const practice of soilData.managementPractices) {
          if (practice.timing && practice.timing.toLowerCase().includes(stage)) {
            advisories.push({
              crop: crop,
              activity: practice.practice,
              description: practice.description,
              contextualReason: `Soil type: ${soilType}. Recommended practice for ${stage} stage on this soil type.`,
              source: soilData.source || 'Soil Management Database'
            });
          }
        }
      }

      // Suggest amendments if needed
      if (soilData.fertility && soilData.fertility.rating === 'Low' && soilData.amendments) {
        for (const amendment of soilData.amendments) {
          advisories.push({
            crop: crop,
            activity: `Soil Amendment - ${amendment.amendment}`,
            description: `Apply ${amendment.ratePerHa} per hectare. Purpose: ${amendment.purpose}`,
            contextualReason: `Soil fertility is low for this soil type. Amendment recommended.`,
            source: soilData.source || 'Soil Management Database'
          });
        }
      }

      return advisories;
    } catch (error) {
      console.error('Error getting soil-specific advisories:', error.message);
      return [];
    }
  }

  /**
   * Get weather-based advisories
   * @param {Object} weatherData
   * @param {String} crop
   * @param {String} stage
   * @returns {Array}
   */
  getWeatherBasedAdvisories(weatherData, crop, stage) {
    const advisories = [];

    if (!weatherData.data || weatherData.data.length === 0) {
      return advisories;
    }

    // Check rainfall patterns
    const recentRainfall = weatherData.data.slice(-3).reduce((sum, day) => {
      return sum + (day.precipitation.mm || 0);
    }, 0);

    if (recentRainfall > 50) {
      advisories.push({
        crop: crop,
        activity: 'Weather Response - Heavy Rainfall',
        description: 'Recent heavy rainfall recorded. Delay fertiliser application until excessive moisture has drained or subsided. Monitor for waterlogging and disease pressure.',
        contextualReason: `Heavy rainfall (${recentRainfall}mm) detected at your location. Timely action needed.`,
        source: 'NASA POWER Weather Data'
      });
    }

    if (recentRainfall < 5) {
      advisories.push({
        crop: crop,
        activity: 'Weather Response - Dry Conditions',
        description: 'Low rainfall observed in this rain-fed farming context. Delay planting until effective rainfall and adequate soil moisture are established. Use mulch and conservation practices to reduce moisture loss. Monitor for pest/disease stress.',
        contextualReason: `Dry conditions (${recentRainfall}mm rainfall in last 3 days). Water management needed.`,
        source: 'NASA POWER Weather Data'
      });
    }

    // Check temperature patterns
    const avgTemp = weatherData.data.slice(-3).reduce((sum, day) => {
      return sum + (day.temperature.celsius || 0);
    }, 0) / 3;

    if (avgTemp < 15) {
      advisories.push({
        crop: crop,
        activity: 'Weather Response - Low Temperature',
        description: 'Cold temperatures recorded. Crop growth may slow. Monitor for crop stress and adjust management practices.',
        contextualReason: `Low average temperature (${avgTemp.toFixed(1)}°C). May affect crop development.`,
        source: 'NASA POWER Weather Data'
      });
    }

    return advisories;
  }

  /**
   * Get pest and disease prevention advisories
   * @param {Object} cropKnowledge
   * @param {String} stage
   * @returns {Array}
   */
  getPestDiseaseAdvisories(cropKnowledge, stage) {
    const advisories = [];

    if (!cropKnowledge.pestDiseaseManagement) {
      return advisories;
    }

    for (const pest of cropKnowledge.pestDiseaseManagement) {
      if (stage === 'vegetative' || stage === 'flowering') {
        advisories.push({
          crop: cropKnowledge.cropName,
          activity: `Disease/Pest Prevention - ${pest.pestName}`,
          description: `Preventive measures: ${pest.preventiveMeasures}. If symptoms appear, implement control measures: ${pest.controlMeasures}`,
          contextualReason: `${pest.pestName} pressure typically high in ${stage} stage.`,
          source: cropKnowledge.source || 'Agricultural Knowledge Base'
        });
      }
    }

    return advisories;
  }
}

module.exports = new AdvisoryRuleEngine();
