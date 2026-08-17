const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const AgriculturalKnowledge = require('../models/AgriculturalKnowledge');
const SoilData = require('../models/SoilData');
const DiseaseKnowledge = require('../models/DiseaseKnowledge');

/**
 * GET /api/knowledge/agricultural
 * Get agricultural knowledge for all crops or specific crop
 * Query: ?crop=crop_name
 */
router.get('/agricultural', protect, async (req, res) => {
  try {
    const query = { isActive: true };
    
    if (req.query.crop) {
      query.cropName = { $regex: req.query.crop, $options: 'i' };
    }

    if (req.query.region) {
      query.agroEcologicalRegion = req.query.region;
    }

    const knowledge = await AgriculturalKnowledge.find(query)
      .select('cropName variety agroEcologicalRegion plantingPeriod growthStages fertiliserRecs source');

    res.json({
      success: true,
      count: knowledge.length,
      data: knowledge
    });
  } catch (error) {
    console.error('Error fetching agricultural knowledge:', error);
    res.status(500).json({
      success: false,
      message: `Error fetching agricultural knowledge: ${error.message}`
    });
  }
});

/**
 * GET /api/knowledge/agricultural/:id
 * Get detailed agricultural knowledge for a crop
 */
router.get('/agricultural/:id', protect, async (req, res) => {
  try {
    const knowledge = await AgriculturalKnowledge.findById(req.params.id);

    if (!knowledge) {
      return res.status(404).json({
        success: false,
        message: 'Agricultural knowledge not found'
      });
    }

    res.json({
      success: true,
      data: knowledge
    });
  } catch (error) {
    console.error('Error fetching agricultural knowledge:', error);
    res.status(500).json({
      success: false,
      message: `Error fetching agricultural knowledge: ${error.message}`
    });
  }
});

/**
 * GET /api/knowledge/soil
 * Get soil knowledge
 * Query: ?soilType=type&region=III
 */
router.get('/soil', protect, async (req, res) => {
  try {
    const query = { isActive: true };
    
    if (req.query.soilType) {
      query.soilType = { $regex: req.query.soilType, $options: 'i' };
    }

    if (req.query.region) {
      query.agroEcologicalRegion = req.query.region;
    }

    const soilData = await SoilData.find(query)
      .select('soilType characteristics suitableCrops fertility managementPractices');

    res.json({
      success: true,
      count: soilData.length,
      data: soilData
    });
  } catch (error) {
    console.error('Error fetching soil knowledge:', error);
    res.status(500).json({
      success: false,
      message: `Error fetching soil knowledge: ${error.message}`
    });
  }
});

/**
 * GET /api/knowledge/soil/:id
 * Get detailed soil information
 */
router.get('/soil/:id', protect, async (req, res) => {
  try {
    const soilData = await SoilData.findById(req.params.id);

    if (!soilData) {
      return res.status(404).json({
        success: false,
        message: 'Soil data not found'
      });
    }

    res.json({
      success: true,
      data: soilData
    });
  } catch (error) {
    console.error('Error fetching soil data:', error);
    res.status(500).json({
      success: false,
      message: `Error fetching soil data: ${error.message}`
    });
  }
});

/**
 * GET /api/knowledge/diseases
 * Get disease knowledge
 * Query: ?crop=crop_name&region=III
 */
router.get('/diseases', protect, async (req, res) => {
  try {
    const query = { isActive: true };
    
    if (req.query.crop) {
      query.crop = { $regex: req.query.crop, $options: 'i' };
    }

    if (req.query.region) {
      query.agroEcologicalRegion = req.query.region;
    }

    const diseases = await DiseaseKnowledge.find(query)
      .select('diseaseName crop symptoms severity source');

    res.json({
      success: true,
      count: diseases.length,
      data: diseases
    });
  } catch (error) {
    console.error('Error fetching disease knowledge:', error);
    res.status(500).json({
      success: false,
      message: `Error fetching disease knowledge: ${error.message}`
    });
  }
});

/**
 * GET /api/knowledge/diseases/:id
 * Get detailed disease information
 */
router.get('/diseases/:id', protect, async (req, res) => {
  try {
    const disease = await DiseaseKnowledge.findById(req.params.id);

    if (!disease) {
      return res.status(404).json({
        success: false,
        message: 'Disease not found'
      });
    }

    res.json({
      success: true,
      data: disease
    });
  } catch (error) {
    console.error('Error fetching disease data:', error);
    res.status(500).json({
      success: false,
      message: `Error fetching disease data: ${error.message}`
    });
  }
});

/**
 * POST /api/knowledge/agricultural (Admin only)
 * Create new agricultural knowledge entry
 */
router.post('/agricultural', protect, authorize('admin'), async (req, res) => {
  try {
    const knowledge = new AgriculturalKnowledge(req.body);
    await knowledge.save();

    res.status(201).json({
      success: true,
      data: knowledge
    });
  } catch (error) {
    console.error('Error creating agricultural knowledge:', error);
    res.status(500).json({
      success: false,
      message: `Error creating agricultural knowledge: ${error.message}`
    });
  }
});

/**
 * POST /api/knowledge/soil (Admin only)
 * Create new soil knowledge entry
 */
router.post('/soil', protect, authorize('admin'), async (req, res) => {
  try {
    const soil = new SoilData(req.body);
    await soil.save();

    res.status(201).json({
      success: true,
      data: soil
    });
  } catch (error) {
    console.error('Error creating soil knowledge:', error);
    res.status(500).json({
      success: false,
      message: `Error creating soil knowledge: ${error.message}`
    });
  }
});

/**
 * POST /api/knowledge/diseases (Admin only)
 * Create new disease knowledge entry
 */
router.post('/diseases', protect, authorize('admin'), async (req, res) => {
  try {
    const disease = new DiseaseKnowledge(req.body);
    await disease.save();

    res.status(201).json({
      success: true,
      data: disease
    });
  } catch (error) {
    console.error('Error creating disease knowledge:', error);
    res.status(500).json({
      success: false,
      message: `Error creating disease knowledge: ${error.message}`
    });
  }
});

module.exports = router;
