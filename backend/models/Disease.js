const mongoose = require('mongoose');

const diseaseSchema = new mongoose.Schema(
  {
    crop:        { type: String, required: true },
    diseaseName: { type: String, required: true },
    symptoms:    [{ type: String }],              // Array of symptom strings
    description: { type: String, default: '' },
    causes:      { type: String, default: '' },
    prevention:  { type: String, default: '' },
    treatment:   { type: String, default: '' },
    imageUrl:    { type: String, default: null },
    severity:    { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Disease', diseaseSchema);
