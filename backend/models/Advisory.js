const mongoose = require('mongoose');

const advisorySchema = new mongoose.Schema(
  {
    crop:            { type: String, required: true },
    activity:        { type: String, required: true },
    description:     { type: String, required: true },
    recommendedDate: { type: Date, required: true },
    instructions:    { type: String, default: '' },
    season:          { type: String, default: 'Main Season' },
    isActive:        { type: Boolean, default: true },
    createdBy:       { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Advisory', advisorySchema);
