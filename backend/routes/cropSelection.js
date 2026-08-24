const express = require('express');
const router = express.Router();
const User = require('../models/User');
const AgriculturalKnowledge = require('../models/AgriculturalKnowledge');
const { protect } = require('../middleware/auth');
const cropKnowledgeQuery = (cropName) => ({
  cropName: new RegExp(`^${String(cropName).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i'),
  agroEcologicalRegion: 'III',
  isActive: true
});
const { SUPPORTED_CROPS } = require('../config/supportedCrops');

/**
 * GET /api/crop-selection/available-crops
 * Get list of crops available for Region III
 */
router.get('/available-crops', async (req, res) => {
  try {
    const crops = await AgriculturalKnowledge.find({ cropName: { $in: SUPPORTED_CROPS }, agroEcologicalRegion: 'III', isActive: true })
      .select('cropName description soilRequirements source datasetVersion')
      .sort({ cropName: 1 }).lean();
    res.json({
      success: true,
      crops: crops.map((crop) => ({ name: crop.cropName, description: crop.description || crop.soilRequirements?.requirements || '', source: crop.source, datasetVersion: crop.datasetVersion })),
      message: 'Available crops for Region III'
    });
  } catch (error) {
    console.error('Error fetching crops:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

router.get('/available-soils', async (req, res) => {
  try {
    const SoilData = require('../models/SoilData');
    const soils = await SoilData.find({ agroEcologicalRegion: 'III', isActive: true }).select('soilType source datasetVersion').sort({ soilType: 1 }).lean();
    res.json({ success: true, soils });
  } catch (error) {
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
    const cropInfo = await AgriculturalKnowledge.findOne(cropKnowledgeQuery(cropName));
    if (!cropInfo) {
      return res.status(400).json({ success: false, message: `${cropName} is not supported by this system` });
    }

    // Return key information for farmer decision
    res.json({
      success: true,
      crop: cropInfo.cropName,
      description: cropInfo.soilRequirements?.requirements || '',
      plantingPeriod: cropInfo.plantingPeriod,
      growthDuration: cropInfo?.growthDuration,
      soilRequirements: cropInfo?.soilRequirements || null,
      source: cropInfo.source,
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

    const requested = requestedCrops.filter(Boolean);
    if (requested.some((crop) => !SUPPORTED_CROPS.some((supported) => supported.toLowerCase() === String(crop).toLowerCase()))) {
      return res.status(400).json({ success: false, message: 'One or more selected crops are outside the supported Region III crop scope' });
    }

    const selectedCrops = await AgriculturalKnowledge.find({
      cropName: { $in: requested.map((crop) => new RegExp(`^${String(crop).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i')) },
      agroEcologicalRegion: 'III', isActive: true
    }).select('cropName source').lean();
    if (selectedCrops.length !== new Set(requestedCrops.filter(Boolean).map((crop) => crop.toLowerCase())).size) {
      return res.status(400).json({ success: false, message: 'One or more selected crops are not supported by this system' });
    }
    const cropNames = selectedCrops.map((crop) => crop.cropName);

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
      crops: selectedCrops.map((crop) => ({ name: crop.cropName, source: crop.source }))
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
        farmingSystem: 'Rain-fed seasonal farming'
      }
    });
  } catch (error) {
    console.error('Error checking status:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
