/**
 * Seed Soil Knowledge Base for Zimbabwe Region III
 * Run: node scripts/seed-soil-data.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

const SoilData = require('../models/SoilData');

const soilDataArray = [
  {
    soilType: 'Sandy Loam',
    agroEcologicalRegion: 'III',
    
    characteristics: {
      texture: 'Sand 60-70%, Silt 15-20%, Clay 10-15%',
      structure: 'Loose, granular',
      color: 'Light brown to reddish',
      ph: 6.2,
      organicMatter: 'Low (1-2%)'
    },
    
    suitableCrops: ['Maize', 'Groundnuts', 'Sorghum', 'Millet'],
    unsuitableCrops: ['Tobacco', 'Rice'],
    
    drainage: {
      type: 'Well drained',
      characteristics: 'Water drains rapidly. May require supplementary irrigation.'
    },
    
    fertility: {
      rating: 'Low to Medium',
      limitingNutrients: ['Nitrogen', 'Phosphorus', 'Organic Matter'],
      recommendations: 'Requires regular fertiliser application. Build organic matter through manure application.'
    },
    
    managementPractices: [
      {
        practice: 'Add organic matter',
        description: 'Incorporate compost, manure, or crop residues to improve water and nutrient holding',
        timing: 'Before planting'
      },
      {
        practice: 'Mulching',
        description: 'Apply 5-10cm mulch layer to conserve moisture',
        timing: 'After planting or weeding'
      },
      {
        practice: 'Conservative cultivation',
        description: 'Minimize soil disturbance to retain moisture and structure',
        timing: 'Throughout season'
      },
      {
        practice: 'Fertiliser split application',
        description: 'Apply fertiliser in 2-3 split doses rather than single application',
        timing: 'Planting and 30-45 days after planting'
      }
    ],
    
    amendments: [
      {
        amendment: 'Farmyard manure',
        ratePerHa: 10000,
        purpose: 'Increase organic matter and nutrient content'
      },
      {
        amendment: 'Lime (if acidic)',
        ratePerHa: 2000,
        purpose: 'Raise pH if below 5.8'
      }
    ],
    
    source: 'Zimbabwe Agricultural Research Institute (ZARI)',
    reference: 'ZARI Soil Survey and Classification Report Region III, 2022'
  },

  {
    soilType: 'Clay Loam',
    agroEcologicalRegion: 'III',
    
    characteristics: {
      texture: 'Sand 40-50%, Silt 20-30%, Clay 25-35%',
      structure: 'Moderate blocky',
      color: 'Dark brown to reddish-brown',
      ph: 6.5,
      organicMatter: 'Moderate (2-4%)'
    },
    
    suitableCrops: ['Maize', 'Tobacco', 'Sorghum'],
    unsuitableCrops: [],
    
    drainage: {
      type: 'Moderately well drained',
      characteristics: 'Good water holding capacity. May have waterlogging issues in high rainfall years.'
    },
    
    fertility: {
      rating: 'Medium',
      limitingNutrients: ['Nitrogen', 'Phosphorus'],
      recommendations: 'Good baseline fertility. Respond well to fertiliser application.'
    },
    
    managementPractices: [
      {
        practice: 'Proper drainage',
        description: 'Establish contour ridges or drainage channels to prevent waterlogging',
        timing: 'Before planting'
      },
      {
        practice: 'Avoid compaction',
        description: 'Minimize traffic on wet soil to avoid compaction and crusting',
        timing: 'Entire season, especially after rain'
      },
      {
        practice: 'Minimum tillage',
        description: 'Reduce soil disturbance to maintain structure',
        timing: 'Seedbed preparation'
      },
      {
        practice: 'Crop rotation',
        description: 'Rotate crops to manage disease and soil fertility',
        timing: 'Season to season'
      }
    ],
    
    amendments: [
      {
        amendment: 'Organic matter',
        ratePerHa: 5000,
        purpose: 'Improve soil structure and reduce compaction risk'
      },
      {
        amendment: 'Phosphate fertiliser',
        ratePerHa: 250,
        purpose: 'Address phosphorus deficiency'
      }
    ],
    
    source: 'Zimbabwe Agricultural Research Institute (ZARI)',
    reference: 'ZARI Soil Survey and Classification Report Region III, 2022'
  },

  {
    soilType: 'Red Clay',
    agroEcologicalRegion: 'III',
    
    characteristics: {
      texture: 'Sand 20-30%, Silt 15-25%, Clay 50-65%',
      structure: 'Strong blocky to prismatic',
      color: 'Red to reddish-brown',
      ph: 5.8,
      organicMatter: 'Variable (1-3%)'
    },
    
    suitableCrops: ['Tobacco', 'Cotton', 'Maize (where drainage good)'],
    unsuitableCrops: ['Groundnuts', 'Rice (unless irrigated)'],
    
    drainage: {
      type: 'Slowly to poorly drained',
      characteristics: 'High water holding capacity. Risk of waterlogging and restricting root growth.'
    },
    
    fertility: {
      rating: 'Medium to High',
      limitingNutrients: ['Nitrogen'],
      recommendations: 'Good nutrient reserves. Potential aluminum toxicity at low pH. Monitor pH.'
    },
    
    managementPractices: [
      {
        practice: 'Lime application',
        description: 'Apply lime to raise pH above 6.0 and reduce aluminum toxicity',
        timing: 'Before planting'
      },
      {
        practice: 'Establish drainage',
        description: 'Create contour ridges and drainage channels for water management',
        timing: 'Before planting'
      },
      {
        practice: 'Avoid heavy traffic',
        description: 'Minimize compaction which restricts root penetration in clay soils',
        timing: 'Entire season'
      },
      {
        practice: 'Add organic matter',
        description: 'Incorporate crop residues to improve soil structure',
        timing: 'Before planting'
      }
    ],
    
    amendments: [
      {
        amendment: 'Agricultural lime',
        ratePerHa: 2500,
        purpose: 'Raise pH and reduce aluminum toxicity if pH < 5.8'
      },
      {
        amendment: 'Phosphate fertiliser',
        ratePerHa: 200,
        purpose: 'Address phosphorus fixation at low pH'
      },
      {
        amendment: 'Gypsum',
        ratePerHa: 1000,
        purpose: 'Improve soil structure if sodium is problem'
      }
    ],
    
    source: 'Zimbabwe Agricultural Research Institute (ZARI)',
    reference: 'ZARI Soil Survey and Classification Report Region III, 2022'
  }
];

// Connect to MongoDB and seed data
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/crop-advisory')
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    
    try {
      // Clear existing data
      await SoilData.deleteMany({ agroEcologicalRegion: 'III' });
      console.log('🗑️  Cleared existing Region III soil data');
      
      // Insert new data
      await SoilData.insertMany(soilDataArray);
      console.log(`✅ Seeded ${soilDataArray.length} soil data entries for Region III`);
      
      process.exit(0);
    } catch (error) {
      console.error('❌ Error seeding data:', error.message);
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });
