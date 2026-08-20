const mongoose = require('mongoose');

const cropProgressSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    crop: { type: String, required: true },
    stageId: { type: String, required: true },
    stageName: { type: String, required: true },
    completedAt: { type: Date, default: Date.now },
    notes: { type: String, default: '' }
  },
  { timestamps: true }
);

cropProgressSchema.index({ userId: 1, crop: 1, stageId: 1 }, { unique: true });

module.exports = mongoose.model('CropProgress', cropProgressSchema);
