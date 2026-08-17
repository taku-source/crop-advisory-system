const mongoose = require('mongoose');

const agriculturalKnowledgeSchema = new mongoose.Schema(
  {
    cropName:             { type: String, required: true },
    variety:              { type: String, default: '' },
    agroEcologicalRegion: { type: String, enum: ['I', 'II', 'III', 'IV', 'V'], default: 'III' },
    
    // Planting information
    plantingPeriod:       { type: String, required: true },  // e.g., "November - December"
    plantingWindow:       {
      startMonth: { type: Number, min: 1, max: 12 },
      endMonth:   { type: Number, min: 1, max: 12 }
    },
    
    // Crop growth stages and activities
    growthStages:         [
      {
        stageName:        { type: String },  // e.g., "Seedling", "Vegetative", "Flowering"
        daysAfterPlanting: { type: Number },
        activities:       [
          {
            activityName: { type: String },
            description:  { type: String },
            timing:       { type: String }
          }
        ]
      }
    ],
    
    // Fertiliser recommendations
    fertiliserRecs:       [
      {
        type:             { type: String },  // e.g., "NPK", "Urea"
        rateKgPerHa:      { type: Number },
        timing:           { type: String },
        description:      { type: String }
      }
    ],
    
    // Pest and disease management
    pestDiseaseManagement: [
      {
        pestName:        { type: String },
        controlMeasures: { type: String },
        preventiveMeasures: { type: String }
      }
    ],
    
    // Soil requirements
    soilRequirements:     {
      preferredType:     { type: String },      // e.g., "Sandy loam"
      minPh:            { type: Number },
      maxPh:            { type: Number },
      requirements:     { type: String }
    },
    
    // Water requirements
    waterRequirements:    {
      rainfallNeeded:   { type: String },      // e.g., "600-1000 mm"
      criticalStages:   { type: String },
      irrigationTips:   { type: String }
    },
    
    // Source and reference
    source:              { type: String, default: '' },  // e.g., "FAO Guidelines", "Zimbabwe Agritex"
    reference:          { type: String, default: '' },
    
    isActive:            { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('AgriculturalKnowledge', agriculturalKnowledgeSchema);
