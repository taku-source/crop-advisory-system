const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const nasaPowerService = require('../services/nasaPowerService');

/**
 * PUT /api/farmers/profile
 * Update farmer profile including location, soil type, and crop
 */
router.put('/profile', protect, async (req, res) => {
  try {
    const { location, soilType, primaryCrop, primaryCrops, plantingDate } = req.body;

    const updateData = {};

    // Update location if provided
    if (location && location.latitude && location.longitude) {
      // Validate Zimbabwe coordinates
      if (!nasaPowerService.isZimbabweLocation(location.latitude, location.longitude)) {
        return res.status(400).json({
          success: false,
          message: 'Location must be within Zimbabwe'
        });
      }

      updateData.location = {
        latitude: location.latitude,
        longitude: location.longitude,
        lastUpdated: new Date()
      };
    }

    // Update soil type if provided
    if (soilType) {
      updateData.soilType = soilType;
    }

    // Update primary crop if provided
    if (primaryCrop) {
      updateData.primaryCrop = primaryCrop;
    }
    if (Array.isArray(primaryCrops) && primaryCrops.length > 0) {
      updateData.primaryCrops = primaryCrops.slice(0, 3);
      updateData.primaryCrop = primaryCrops[0];
    }

    // Add planting date if provided
    if (plantingDate) {
      updateData.plantingDate = new Date(plantingDate);
    }

    // Mark profile as completed
    updateData.profileCompleted = true;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: `Error updating profile: ${error.message}`
    });
  }
});

/**
 * PUT /api/farmers/location
 * Update farmer GPS location specifically
 */
router.put('/location', protect, async (req, res) => {
  try {
    const { latitude, longitude } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({
        success: false,
        message: 'Latitude and longitude are required'
      });
    }

    // Validate coordinates
    if (!nasaPowerService.isZimbabweLocation(latitude, longitude)) {
      return res.status(400).json({
        success: false,
        message: 'Location must be within Zimbabwe boundaries'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        location: {
          latitude,
          longitude,
          lastUpdated: new Date()
        }
      },
      { new: true }
    );

    res.json({
      success: true,
      message: 'Location updated successfully',
      data: {
        latitude: user.location.latitude,
        longitude: user.location.longitude,
        lastUpdated: user.location.lastUpdated
      }
    });
  } catch (error) {
    console.error('Error updating location:', error);
    res.status(500).json({
      success: false,
      message: `Error updating location: ${error.message}`
    });
  }
});

/**
 * GET /api/farmers/profile
 * Get logged-in farmer's profile
 */
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        district: user.district,
        ward: user.ward,
        farmName: user.farmName,
        farmSize: user.farmSize,
        location: user.location,
        soilType: user.soilType,
        primaryCrop: user.primaryCrop,
        profileCompleted: user.profileCompleted,
        plantingDate: user.plantingDate
      }
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({
      success: false,
      message: `Error fetching profile: ${error.message}`
    });
  }
});

module.exports = router;
