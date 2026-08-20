const express = require('express');
const router = express.Router();
const User = require('../models/User');
const AgriculturalKnowledge = require('../models/AgriculturalKnowledge');
const { protect } = require('../middleware/auth');
const { supportedCrops, getSupportedCrop, getSupportedCropNames, getSupportedCrops } = require('../config/supportedCrops');

const cropKnowledgeQuery = (cropName) => ({
  $or: getSupportedCropNames(cropName).map((name) => ({ cropName: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') })),
  agroEcologicalRegion: 'III',
  isActive: true
});

/**
 * GET /api/crop-selection/available-crops
 * Get list of crops available for Region III
 */
router.get('/available-crops', protect, async (req, res) => {
  try {
    res.json({
      success: true,
      crops: supportedCrops.map(({ name, description, icon }) => ({ name, description, icon })),
      message: 'Available crops for Region III'
    });
  } catch (error) {
    console.error('Error fetching crops:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/crop-selection/crop-info/:cropName
 * Get detailed information about a specific crop for Region III
 */
router.get('/crop-info/:cropName', protect, async (req, res) => {
  try {
    const cropName = req.params.cropName;
    const supportedCrop = getSupportedCrop(cropName);
    if (!supportedCrop) {
      return res.status(400).json({ success: false, message: `${cropName} is not supported by this system` });
    }
    const cropInfo = await AgriculturalKnowledge.findOne(cropKnowledgeQuery(supportedCrop.name));

    // Return key information for farmer decision
    res.json({
      success: true,
      crop: supportedCrop.name,
      description: supportedCrop.description,
      icon: supportedCrop.icon,
      plantingPeriod: cropInfo?.plantingPeriod || 'See the stage plan after selection',
      growthDuration: cropInfo?.growthDuration,
      soilRequirements: cropInfo?.soilRequirements || null,
      source: cropInfo?.source || 'Verified Region III dataset',
      region: 'Agro-Ecological Region III'
    });
  } catch (error) {
    console.error('Error fetching crop info:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/crop-selection/select-crop
 * Farmer selects their primary crop after first login
 */
router.post('/select-crop', protect, async (req, res) => {
  try {
    const requestedCrops = Array.isArray(req.body.cropNames) ? req.body.cropNames : [req.body.cropName];
    const farmerId = req.user.id;

    if (!requestedCrops.filter(Boolean).length) {
      return res.status(400).json({ 
        success: false, 
        message: 'Select at least one crop' 
      });
    }
    if (requestedCrops.filter(Boolean).length > 3) {
      return res.status(400).json({ success: false, message: 'You can select up to three crops' });
    }

    const selectedCrops = getSupportedCrops(requestedCrops.filter(Boolean));
    if (selectedCrops.length !== requestedCrops.filter(Boolean).length) {
      return res.status(400).json({ success: false, message: 'One or more selected crops are not supported by this system' });
    }
    const cropNames = selectedCrops.map((crop) => crop.name);

    // Update farmer profile
    const farmer = await User.findByIdAndUpdate(
      farmerId,
      {
        primaryCrop: cropNames[0],
        primaryCrops: cropNames,
        hasSelectedCrop: true,
        cropSelectionDate: new Date()
      },
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: `${cropNames.join(', ')} selected successfully`,
      farmer: farmer.toJSON(),
      crops: selectedCrops.map((crop) => ({ name: crop.name, description: crop.description }))
    });
  } catch (error) {
    console.error('Error selecting crop:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/crop-selection/check-status
 * Check if farmer has selected crop (for first-login detection)
 */
router.get('/check-status', protect, async (req, res) => {
  try {
    const farmer = await User.findById(req.user.id);
    
    res.json({
      success: true,
      hasSelectedCrop: farmer.hasSelectedCrop,
      primaryCrop: farmer.primaryCrop,
      primaryCrops: farmer.primaryCrops?.length ? farmer.primaryCrops : (farmer.primaryCrop ? [farmer.primaryCrop] : []),
      isAdvisoryReady: farmer.isAdvisoryReady(),
      profileStatus: {
        hasLocation: !!(farmer.location && farmer.location.latitude && farmer.location.longitude),
        hasSoilType: !!farmer.soilType,
        hasCrop: !!farmer.primaryCrop,
        hasIrrigation: !!farmer.irrigationMethod
      }
    });
  } catch (error) {
    console.error('Error checking status:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
