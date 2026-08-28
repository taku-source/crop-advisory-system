const mongoose = require('mongoose');

const recordSchema = new mongoose.Schema(
  {
    userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    category: {
      type: String,
      enum: ['Planting', 'Fertilizer', 'Pesticide', 'Harvest', 'Expense', 'Crop Progress'],
      required: true,
    },
    // Common fields
    crop:  { type: String },
    date:  { type: Date, required: true },
    notes: { type: String, default: '' },

    // Planting
    variety: { type: String },
    area:    { type: String },

    // Fertilizer / Pesticide
    productName: { type: String },
    quantity:    { type: String },

    // Harvest
    quantityHarvested: { type: String },

    // Crop progress
    growthStage: { type: String },
    progressPercent: { type: Number, min: 0, max: 100 },
    plantHeight: { type: String },
    observedIssues: { type: String },

    // Expense
    item: { type: String },
    cost: { type: Number },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Record', recordSchema);
