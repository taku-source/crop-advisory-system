/**
 * Seed Disease Knowledge Base for Zimbabwe Region III
 * Run: node scripts/seed-disease-knowledge.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

const DiseaseKnowledge = require('../models/DiseaseKnowledge');

const diseaseData = [
  {
    diseaseName: 'Maize Lethal Necrosis Virus (MLN)',
    crop: 'Maize',
    agroEcologicalRegion: 'III',
    
    symptoms: [
      {
        symptom: 'Leaf mottling and necrosis',
        weight: 9,
        description: 'Green and yellow mottling on leaves, progressing to tissue death',
        affectedParts: ['leaves']
      },
      {
        symptom: 'Stunted growth',
        weight: 8,
        description: 'Severely reduced plant height and vigor',
        affectedParts: ['whole plant']
      },
      {
        symptom: 'Yellowing of leaves',
        weight: 7,
        description: 'Progressive yellowing starting from lower leaves',
        affectedParts: ['leaves']
      },
      {
        symptom: 'Barren cobs',
        weight: 8,
        description: 'Cobs with no grain or severely reduced grain',
        affectedParts: ['ears']
      },
      {
        symptom: 'Leaf rolling',
        weight: 6,
        description: 'Leaves roll and wither',
        affectedParts: ['leaves']
      }
    ],
    
    causativeAgent: 'Viral (double infection: SCMV + MCMV)',
    
    favourableConditions: [
      {
        condition: 'High insect vector populations',
        description: 'Aphids and thrips transmit the virus'
      },
      {
        condition: 'Early infection timing',
        description: 'Infection at seedling stage causes severe symptoms'
      },
      {
        condition: 'Continuous maize cropping',
        description: 'Virus spreads rapidly in maize-only fields'
      }
    ],
    
    severity: 'High',
    severityDescription: 'MLN causes 50-100% crop loss. Once infected, plants cannot be saved.',
    
    managementMeasures: [
      {
        measure: 'Remove infected plants',
        description: 'Uproot and destroy infected plants immediately',
        timing: 'At first signs of infection'
      },
      {
        measure: 'Control vector insects',
        description: 'Spray for aphids and thrips with approved insecticides',
        timing: 'Early season and whenever vectors appear'
      },
      {
        measure: 'Use resistant varieties',
        description: 'Plant varieties with MLN resistance',
        timing: 'At planting time'
      }
    ],
    
    preventiveMeasures: [
      {
        measure: 'Early planting',
        description: 'Plant early to escape peak vector populations'
      },
      {
        measure: 'Avoid mixed cropping',
        description: 'Do not grow maize near other grasses that harbor viruses'
      },
      {
        measure: 'Crop rotation',
        description: 'Rotate with non-host crops'
      },
      {
        measure: 'Rogue infected plants',
        description: 'Remove any symptomatic plants to prevent spread'
      }
    ],
    
    yield_loss: '50-100%',
    economicImportance: 'Critical threat to maize production in Africa. Detected in Zimbabwe.',
    source: 'Zimbabwe Agricultural Research Institute (ZARI)',
    reference: 'ZARI MLN Management Guidelines, 2023'
  },

  {
    diseaseName: 'Fall Armyworm',
    crop: 'Maize',
    agroEcologicalRegion: 'III',
    
    symptoms: [
      {
        symptom: 'Leaf notching and holes',
        weight: 8,
        description: 'Jagged holes and window-like damage in leaves',
        affectedParts: ['leaves']
      },
      {
        symptom: 'Ragged lesions',
        weight: 8,
        description: 'Irregular brown or tan lesions',
        affectedParts: ['leaves']
      },
      {
        symptom: 'Damage at whorl',
        weight: 9,
        description: 'Severe damage to central whorl and emerging leaves',
        affectedParts: ['leaves']
      },
      {
        symptom: 'Stringy fecal material',
        weight: 9,
        description: 'Dark, coarse sawdust-like frass visible in whorl',
        affectedParts: ['leaves']
      },
      {
        symptom: 'Damaged ears',
        weight: 7,
        description: 'Damage to developing grain',
        affectedParts: ['ears']
      }
    ],
    
    causativeAgent: 'Spodoptera frugiperda (Larval feeding)',
    
    favourableConditions: [
      {
        condition: 'Warm temperatures',
        description: 'Prefers temperatures 20-30°C'
      },
      {
        condition: 'High rainfall',
        description: 'Humid conditions favor population growth'
      },
      {
        condition: 'Continuous maize cultivation',
        description: 'Favors pest populations'
      }
    ],
    
    severity: 'High',
    severityDescription: 'Can cause 20-60% crop loss if not managed early',
    
    managementMeasures: [
      {
        measure: 'Spray with Chlorantraniliprole (Coragen)',
        description: 'Use 0.3ml/L or as per label. Highly effective against armyworm larvae',
        timing: 'When moths are active and larvae are young (V2-V6 stage)'
      },
      {
        measure: 'Spinosad-based biopesticide',
        description: 'Natural alternative to synthetic insecticides',
        timing: 'Early instar larvae for best results'
      },
      {
        measure: 'Manual removal',
        description: 'Hand-pick larvae from whorl',
        timing: 'Small field situations'
      }
    ],
    
    preventiveMeasures: [
      {
        measure: 'Scout regularly',
        description: 'Check 20-30 plants weekly for larvae and damage'
      },
      {
        measure: 'Use pheromone traps',
        description: 'Monitor adult moth populations'
      },
      {
        measure: 'Early planting',
        description: 'Plants that reach V6 stage early may escape peak pest pressure'
      },
      {
        measure: 'Destroy crop residues',
        description: 'Remove crop remains to reduce pest breeding'
      }
    ],
    
    yield_loss: '20-60%',
    economicImportance: 'Invasive pest. Recent invasion to Africa. Major threat to maize.',
    source: 'Zimbabwe Agricultural Research Institute (ZARI)',
    reference: 'ZARI Fall Armyworm Management 2023, FAO Management Guidelines'
  },

  {
    diseaseName: 'Early Maize Blight',
    crop: 'Maize',
    agroEcologicalRegion: 'III',
    
    symptoms: [
      {
        symptom: 'Leaf spots with concentric rings',
        weight: 8,
        description: 'Small tan spots with reddish-brown or dark rings',
        affectedParts: ['leaves']
      },
      {
        symptom: 'Yellowing around spots',
        weight: 7,
        description: 'Yellow halo around the lesion',
        affectedParts: ['leaves']
      },
      {
        symptom: 'Lesions on stalk and husks',
        weight: 7,
        description: 'Similar spots on stem and ear husks',
        affectedParts: ['stalk', 'husks']
      },
      {
        symptom: 'Leaf wilting',
        weight: 6,
        description: 'Affected leaves may wilt and die',
        affectedParts: ['leaves']
      }
    ],
    
    causativeAgent: 'Fungal (Bipolaris zeicola / Helminthosporium)',
    
    favourableConditions: [
      {
        condition: 'High humidity',
        description: 'Spores need moisture for germination'
      },
      {
        condition: 'Warm temperatures',
        description: 'Optimal 20-28°C'
      },
      {
        condition: 'Overhead irrigation or rain',
        description: 'Wet leaf surfaces favor infection'
      }
    ],
    
    severity: 'Medium',
    severityDescription: 'Can cause 10-30% yield loss if severe',
    
    managementMeasures: [
      {
        measure: 'Fungicide spray',
        description: 'Use propiconazole, mancozeb, or other fungicides at label rates',
        timing: 'When conditions favor disease (high humidity/rain)'
      },
      {
        measure: 'Improve air circulation',
        description: 'Space plants adequately to reduce leaf wetness duration',
        timing: 'At planting'
      }
    ],
    
    preventiveMeasures: [
      {
        measure: 'Use resistant varieties',
        description: 'Choose varieties with early blight resistance'
      },
      {
        measure: 'Remove lower leaves',
        description: 'Remove infected leaves to reduce spore source'
      },
      {
        measure: 'Destroy crop residues',
        description: 'Plow under or burn maize stover after harvest'
      },
      {
        measure: 'Avoid overhead irrigation',
        description: 'Use drip irrigation to keep leaves dry'
      }
    ],
    
    yield_loss: '10-30%',
    economicImportance: 'Common in humid regions and where overhead water is used',
    source: 'Zimbabwe Agricultural Research Institute (ZARI)',
    reference: 'ZARI Early Blight Management Guidelines, 2023'
  },

  {
    diseaseName: 'Groundnut Rosette Virus',
    crop: 'Groundnuts',
    agroEcologicalRegion: 'III',
    
    symptoms: [
      {
        symptom: 'Leaflet mottling',
        weight: 9,
        description: 'Light and dark green mottling on leaflets',
        affectedParts: ['leaves']
      },
      {
        symptom: 'Stunted growth',
        weight: 9,
        description: 'Plants remain small and produce few pods',
        affectedParts: ['whole plant']
      },
      {
        symptom: 'Leaf distortion',
        weight: 7,
        description: 'Leaflets become warped and misshapen',
        affectedParts: ['leaves']
      },
      {
        symptom: 'Reduced pod set',
        weight: 8,
        description: 'Few or no pods develop',
        affectedParts: ['reproductive organs']
      },
      {
        symptom: 'Rosette-like appearance',
        weight: 8,
        description: 'Plant forms dense rosette due to stunting',
        affectedParts: ['whole plant']
      }
    ],
    
    causativeAgent: 'Viral (Groundnut Rosette Virus - GRV, transmitted by aphids)',
    
    favourableConditions: [
      {
        condition: 'High aphid populations',
        description: 'Aphis craccivora transmits the virus'
      },
      {
        condition: 'Planting near infected fields',
        description: 'Virus spreads from existing infections'
      },
      {
        condition: 'Legume crops nearby',
        description: 'Alternate hosts harbor the virus'
      }
    ],
    
    severity: 'High',
    severityDescription: 'Infected plants produce 0-30% of normal yield',
    
    managementMeasures: [
      {
        measure: 'Remove infected plants',
        description: 'Uproot and destroy any rosette-infected plants',
        timing: 'As soon as symptoms appear'
      },
      {
        measure: 'Control aphid vectors',
        description: 'Spray with aphicide to reduce virus transmission',
        timing: 'Early season, especially 30-60 days after planting'
      }
    ],
    
    preventiveMeasures: [
      {
        measure: 'Plant away from infected fields',
        description: 'Maintain distance from previously affected areas'
      },
      {
        measure: 'Use resistant varieties',
        description: 'Plant varieties with rosette resistance'
      },
      {
        measure: 'Crop rotation',
        description: 'Rotate with non-legume crops'
      },
      {
        measure: 'Scout and remove infected plants early',
        description: 'Rogue infected plants before virus spreads'
      }
    ],
    
    yield_loss: '70-100%',
    economicImportance: 'Major limiting factor for groundnut production in Africa',
    source: 'Zimbabwe Agricultural Research Institute (ZARI)',
    reference: 'ZARI Groundnut Rosette Management, 2023'
  }
];

// Connect to MongoDB and seed data
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/crop-advisory')
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    
    try {
      // Clear existing data
      await DiseaseKnowledge.deleteMany({ agroEcologicalRegion: 'III' });
      console.log('🗑️  Cleared existing Region III disease knowledge');
      
      // Insert new data
      await DiseaseKnowledge.insertMany(diseaseData);
      console.log(`✅ Seeded ${diseaseData.length} disease knowledge entries for Region III`);
      
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
