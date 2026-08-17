/**
 * Seed Agricultural Knowledge Base for Zimbabwe Region III
 * Run: node scripts/seed-agricultural-knowledge.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

const AgriculturalKnowledge = require('../models/AgriculturalKnowledge');

const agriculturalData = [
  {
    cropName: 'Maize',
    variety: 'SC 513',
    agroEcologicalRegion: 'III',
    plantingPeriod: 'November - December',
    plantingWindow: { startMonth: 11, endMonth: 12 },
    
    growthStages: [
      {
        stageName: 'Seedling',
        daysAfterPlanting: 14,
        activities: [
          {
            activityName: 'Monitor germination',
            description: 'Check seedling emergence and vigor. Ensure adequate moisture.',
            timing: 'Days 3-7 after planting'
          },
          {
            activityName: 'Early weed control',
            description: 'Remove weeds to reduce competition. Hand-hoe or selective herbicide.',
            timing: 'Days 7-14 after planting'
          },
          {
            activityName: 'Pest monitoring',
            description: 'Scout for armyworms and cutworms. Monitor bird damage.',
            timing: 'Daily during seedling stage'
          }
        ]
      },
      {
        stageName: 'Vegetative',
        daysAfterPlanting: 45,
        activities: [
          {
            activityName: 'Fertiliser application (Top dressing)',
            description: 'Apply nitrogen fertiliser at V4-V6 stage (4-6 leaves visible).',
            timing: 'Days 20-30 after planting'
          },
          {
            activityName: 'Second weeding',
            description: 'Mechanical weeding or herbicide application.',
            timing: 'Days 30-45 after planting'
          },
          {
            activityName: 'Pest and disease management',
            description: 'Monitor for fall armyworm, stem borers, and early blight.',
            timing: 'Continuous monitoring'
          },
          {
            activityName: 'Thinning (if needed)',
            description: 'Ensure 25,000-30,000 plants per hectare.',
            timing: 'Days 10-20 after planting'
          }
        ]
      },
      {
        stageName: 'Flowering',
        daysAfterPlanting: 75,
        activities: [
          {
            activityName: 'Monitor silk emergence',
            description: 'Check for synchronized tasseling and silking.',
            timing: 'Days 50-70 after planting'
          },
          {
            activityName: 'Avoid water stress',
            description: 'Ensure adequate moisture during flowering. Critical period for yield.',
            timing: 'Continuous during flowering'
          },
          {
            activityName: 'Pest control intensification',
            description: 'Monitor for stem borers and other pests during flowering.',
            timing: 'Weekly scouting'
          }
        ]
      },
      {
        stageName: 'Grain Fill',
        daysAfterPlanting: 120,
        activities: [
          {
            activityName: 'Monitor grain development',
            description: 'Check kernel development and moisture content.',
            timing: 'Days 70-110 after planting'
          },
          {
            activityName: 'Prevent water-logging',
            description: 'Ensure good drainage to prevent grain rot.',
            timing: 'Continuous during grain fill'
          },
          {
            activityName: 'Monitor for diseases',
            description: 'Watch for maize lethal necrosis and other late-season diseases.',
            timing: 'Weekly scouting'
          }
        ]
      }
    ],
    
    fertiliserRecs: [
      {
        type: 'Basal (NPK)',
        rateKgPerHa: 200,
        timing: 'At planting or pre-planting',
        description: 'Use NPK 13:7:6 or 10:10:10. Mix into top 10cm of soil.'
      },
      {
        type: 'Top dressing (Urea)',
        rateKgPerHa: 150,
        timing: 'V4-V6 stage (vegetative)',
        description: 'Side-apply 46% Urea. Keep 5cm away from base to avoid burning.'
      },
      {
        type: 'Split application',
        rateKgPerHa: 75,
        timing: 'Two weeks after first top dressing',
        description: 'Optional second urea application if soil is sandy or rainfall is high.'
      }
    ],
    
    pestDiseaseManagement: [
      {
        pestName: 'Fall Armyworm (Spodoptera frugiperda)',
        controlMeasures: 'Spray with chlorantraniliprole 18.3% SC (Coragen) at 0.3ml/L or similar biopesticide.',
        preventiveMeasures: 'Scout regularly. Destroy infested plant parts. Use pheromone traps.'
      },
      {
        pestName: 'Stem borers (Busseola fusca)',
        controlMeasures: 'Apply chlorantraniliprole or spinosad-based insecticides. Manual removal of borers.',
        preventiveMeasures: 'Remove crop residues. Rotate with non-host crops. Early planting helps.'
      },
      {
        pestName: 'Maize Lethal Necrosis Virus',
        controlMeasures: 'No direct cure. Manage vectors (aphids, thrips). Remove infected plants.',
        preventiveMeasures: 'Use resistant varieties. Control vector insects early. Avoid mixed cropping.'
      }
    ],
    
    soilRequirements: {
      preferredType: 'Sandy loam to clay loam',
      minPh: 5.5,
      maxPh: 7.5,
      requirements: 'Maize prefers well-drained soil with good organic matter. Avoid waterlogged conditions.'
    },
    
    waterRequirements: {
      rainfallNeeded: '600-800 mm',
      criticalStages: 'Flowering and grain fill are most critical. Ensure adequate moisture.',
      irrigationTips: 'If supplementary irrigation is available, apply 50-75mm at V6 and tasseling stages.'
    },
    
    source: 'Zimbabwe Agricultural Research Institute (ZARI), FAO Crop Guidelines',
    reference: 'ZARI Maize Production Guide Region III, 2023'
  },
  
  {
    cropName: 'Groundnuts',
    variety: 'Spanish',
    agroEcologicalRegion: 'III',
    plantingPeriod: 'November - December',
    plantingWindow: { startMonth: 11, endMonth: 12 },
    
    growthStages: [
      {
        stageName: 'Seedling',
        daysAfterPlanting: 21,
        activities: [
          {
            activityName: 'Monitor emergence',
            description: 'Check seed germination. Ensure adequate soil moisture.',
            timing: 'Days 5-10 after planting'
          },
          {
            activityName: 'Weed management',
            description: 'First weeding to control early weeds.',
            timing: 'Days 14-21 after planting'
          }
        ]
      },
      {
        stageName: 'Vegetative',
        daysAfterPlanting: 60,
        activities: [
          {
            activityName: 'Second weeding',
            description: 'Remove remaining weeds. Avoid damaging roots.',
            timing: 'Days 35-50 after planting'
          },
          {
            activityName: 'Fertiliser application',
            description: 'Apply split doses of nitrogen and phosphorus.',
            timing: 'Days 20-40 after planting'
          }
        ]
      },
      {
        stageName: 'Flowering and Peg Development',
        daysAfterPlanting: 100,
        activities: [
          {
            activityName: 'Monitor flowering',
            description: 'Check for good flower set and peg formation.',
            timing: 'Days 60-90 after planting'
          },
          {
            activityName: 'Ensure adequate moisture',
            description: 'Critical stage - ensure no water stress.',
            timing: 'Continuous during flowering/peg development'
          },
          {
            activityName: 'Monitor pests',
            description: 'Watch for aflatoxin-producing fungi and pests.',
            timing: 'Weekly scouting'
          }
        ]
      }
    ],
    
    fertiliserRecs: [
      {
        type: 'Basal (Single Superphosphate)',
        rateKgPerHa: 250,
        timing: 'At planting',
        description: 'Groundnuts need phosphorus. Avoid excessive nitrogen.'
      },
      {
        type: 'Nitrogen (Optional)',
        rateKgPerHa: 50,
        timing: 'At 30 days after planting',
        description: 'Light nitrogen application if soil is deficient.'
      }
    ],
    
    pestDiseaseManagement: [
      {
        pestName: 'Aflatoxin (Aspergillus flavus)',
        controlMeasures: 'Proper drying to <10% moisture content. Store in cool, dry place.',
        preventiveMeasures: 'Harvest at physiological maturity. Avoid pods touching soil water.'
      },
      {
        pestName: 'Rosette Virus',
        controlMeasures: 'No cure. Remove infected plants immediately. Control aphid vectors.',
        preventiveMeasures: 'Use resistant varieties. Avoid planting near infected fields.'
      }
    ],
    
    soilRequirements: {
      preferredType: 'Sandy loam',
      minPh: 5.8,
      maxPh: 6.8,
      requirements: 'Groundnuts need well-drained soil. Avoid heavy clay and poor drainage.'
    },
    
    waterRequirements: {
      rainfallNeeded: '500-700 mm',
      criticalStages: 'Peg development and pod filling are critical.',
      irrigationTips: 'If available, irrigate during peg development stage (50-80 days after planting).'
    },
    
    source: 'Zimbabwe Agricultural Research Institute (ZARI), FAO Guidelines',
    reference: 'ZARI Groundnuts Production Guide Region III, 2023'
  },
  
  {
    cropName: 'Sorghum',
    variety: 'Hybrid',
    agroEcologicalRegion: 'III',
    plantingPeriod: 'November - January',
    plantingWindow: { startMonth: 11, endMonth: 1 },
    
    growthStages: [
      {
        stageName: 'Seedling',
        daysAfterPlanting: 28,
        activities: [
          {
            activityName: 'Monitor germination',
            description: 'Sorghum has rapid germination. Check for good stand.',
            timing: 'Days 5-10 after planting'
          },
          {
            activityName: 'First weeding',
            description: 'Remove weeds early to reduce competition.',
            timing: 'Days 14-28 after planting'
          }
        ]
      },
      {
        stageName: 'Vegetative',
        daysAfterPlanting: 60,
        activities: [
          {
            activityName: 'Second weeding',
            description: 'Final weeding before boot stage.',
            timing: 'Days 40-60 after planting'
          },
          {
            activityName: 'Nitrogen application',
            description: 'Top-dress with urea for grain production.',
            timing: 'Days 30-45 after planting'
          }
        ]
      },
      {
        stageName: 'Flowering',
        daysAfterPlanting: 90,
        activities: [
          {
            activityName: 'Monitor panicle development',
            description: 'Check for good panicle formation.',
            timing: 'Days 75-90 after planting'
          },
          {
            activityName: 'Pest monitoring',
            description: 'Watch for head bugs and other pests.',
            timing: 'Weekly scouting'
          }
        ]
      }
    ],
    
    fertiliserRecs: [
      {
        type: 'Basal NPK',
        rateKgPerHa: 150,
        timing: 'At planting',
        description: 'Sorghum is drought-tolerant and needs less fertiliser than maize.'
      },
      {
        type: 'Top dressing (Urea)',
        rateKgPerHa: 100,
        timing: 'At 30-45 days after planting',
        description: 'Apply for grain sorghum production.'
      }
    ],
    
    pestDiseaseManagement: [
      {
        pestName: 'Head Bugs',
        controlMeasures: 'Spray with recommended insecticides during flowering.',
        preventiveMeasures: 'Scout regularly. Destroy infected heads.'
      },
      {
        pestName: 'Sorghum Downy Mildew',
        controlMeasures: 'Use resistant varieties. Spray with fungicides if severe.',
        preventiveMeasures: 'Avoid planting in waterlogged areas.'
      }
    ],
    
    soilRequirements: {
      preferredType: 'Any soil type - very adaptable',
      minPh: 5.5,
      maxPh: 8.0,
      requirements: 'Sorghum is drought-resistant and works in most soil types, even poor soils.'
    },
    
    waterRequirements: {
      rainfallNeeded: '400-600 mm',
      criticalStages: 'Flowering is most critical.',
      irrigationTips: 'Sorghum is more drought-tolerant than maize. Suitable for Region III.'
    },
    
    source: 'Zimbabwe Agricultural Research Institute (ZARI), FAO Guidelines',
    reference: 'ZARI Sorghum Production Guide Region III, 2023'
  }
];

// Connect to MongoDB and seed data
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/crop-advisory')
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    
    try {
      // Clear existing data
      await AgriculturalKnowledge.deleteMany({ agroEcologicalRegion: 'III' });
      console.log('🗑️  Cleared existing Region III agricultural knowledge');
      
      // Insert new data
      await AgriculturalKnowledge.insertMany(agriculturalData);
      console.log(`✅ Seeded ${agriculturalData.length} agricultural knowledge entries for Region III`);
      
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
