const mongoose = require('mongoose');

const advisorySchema = new mongoose.Schema(
  {
    crop:            { type: String, required: true },
    activity:        { type: String, required: true },
    description:     { type: String, required: true },
    recommendedDate: { type: Date, required: true },
    instructions:    { type: String, default: '' },
    season:          { type: String, default: 'Main Season' },
    
    // Contextual information
    location: {
      latitude:  { type: Number, default: null },
      longitude: { type: Number, default: null }
    },
    soilType:        { type: String, default: '' },
    cropStage:       { type: String, default: '' },
    
    // Why this advisory is relevant (for personalization)
    contextualReason: { type: String, default: '' },
    
    // Knowledge source reference
    source:          { type: String, default: '' },
    
    // Farmer-specific assignment (optional)
    assignedToFarmers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    
    isActive:        { type: Boolean, default: true },
    createdBy:       { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Advisory', advisorySchema);
