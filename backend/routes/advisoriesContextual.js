const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const advisoryRuleEngine = require('../algorithms/advisoryRuleEngine');
const nasaPowerService = require('../services/nasaPowerService');
const User = require('../models/User');

/**
 * GET /api/advisories/contextual/farmer
 * Get contextual advisories for logged-in farmer
 */
router.get('/contextual/farmer', protect, async (req, res) => {
  try {
    // Get farmer's profile
    const farmer = await User.findById(req.user.id);
    
    if (!farmer) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!farmer.primaryCrop) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please complete your profile by selecting a primary crop' 
      });
    }

    // Generate contextual advisories
    const advisories = await advisoryRuleEngine.generateContextualAdvisories(farmer);

    res.json({
      success: true,
      count: advisories.length,
      data: advisories
    });
  } catch (error) {
    console.error('Error fetching contextual advisories:', error);
    res.status(500).json({ 
      success: false, 
      message: `Error generating advisories: ${error.message}` 
    });
  }
});

/**
 * GET /api/advisories/weather/:farmerId
 * Get weather data for farmer's location from NASA POWER
 */
router.get('/weather/:farmerId', protect, async (req, res) => {
  try {
    const farmer = await User.findById(req.params.farmerId);
    
    if (!farmer) {
      return res.status(404).json({ success: false, message: 'Farmer not found' });
    }

    if (!farmer.location || !farmer.location.latitude || !farmer.location.longitude) {
      return res.status(400).json({ 
        success: false, 
        message: 'Farmer location not set. Please enable location services.' 
      });
    }

    // Get weather data from NASA POWER
    const weatherData = await nasaPowerService.getRecentWeatherData(
      farmer.location.latitude,
      farmer.location.longitude
    );

    res.json({
      success: true,
      data: weatherData
    });
  } catch (error) {
    console.error('Error fetching weather data:', error);
    res.status(500).json({ 
      success: false, 
      message: `Error fetching weather data: ${error.message}` 
    });
  }
});

/**
 * GET /api/advisories/climate/:farmerId
 * Get climatological data for farmer's location
 */
router.get('/climate/:farmerId', protect, async (req, res) => {
  try {
    const farmer = await User.findById(req.params.farmerId);
    
    if (!farmer) {
      return res.status(404).json({ success: false, message: 'Farmer not found' });
    }

    if (!farmer.location || !farmer.location.latitude || !farmer.location.longitude) {
      return res.status(400).json({ 
        success: false, 
        message: 'Farmer location not set. Please enable location services.' 
      });
    }

    const climatologyData = await nasaPowerService.getClimatologyData(
      farmer.location.latitude,
      farmer.location.longitude
    );

    res.json({
      success: true,
      data: climatologyData
    });
  } catch (error) {
    console.error('Error fetching climatology data:', error);
    res.status(500).json({ 
      success: false, 
      message: `Error fetching climatology data: ${error.message}` 
    });
  }
});

module.exports = router;
