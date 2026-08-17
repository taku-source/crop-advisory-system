const mongoose = require('mongoose');

const soilDataSchema = new mongoose.Schema(
  {
    soilType:              { type: String, required: true },  // e.g., "Sandy loam", "Clay", "Loam"
    agroEcologicalRegion:  { type: String, enum: ['I', 'II', 'III', 'IV', 'V'] },
    
    // Soil characteristics
    characteristics:       {
      texture:            { type: String },    // Sand, silt, clay percentages
      structure:          { type: String },
      color:              { type: String },
      ph:                 { type: Number },
      organicMatter:      { type: String }
    },
    
    // Suitability for crops
    suitableCrops:        [{ type: String }],  // Array of crop names
    unsuitableCrops:      [{ type: String }],
    
    // Drainage and water characteristics
    drainage:             {
      type:               { type: String },    // e.g., "Well drained", "Poorly drained"
      characteristics:    { type: String }
    },
    
    // Fertility characteristics
    fertility:            {
      rating:             { type: String },    // e.g., "High", "Medium", "Low"
      limitingNutrients:  [{ type: String }],
      recommendations:    { type: String }
    },
    
    // Management practices
    managementPractices:  [
      {
        practice:         { type: String },
        description:      { type: String },
        timing:           { type: String }
      }
    ],
    
    // Amendments and corrections
    amendments:           [
      {
        amendment:        { type: String },
        ratePerHa:        { type: Number },
        purpose:          { type: String }
      }
    ],
    
    source:              { type: String, default: '' },
    reference:          { type: String, default: '' },
    
    isActive:            { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('SoilData', soilDataSchema);
