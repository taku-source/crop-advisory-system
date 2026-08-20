const mongoose = require('mongoose');

const diseaseKnowledgeSchema = new mongoose.Schema(
  {
    diseaseName:         { type: String, required: true },
    crop:                { type: String, required: true },
    agroEcologicalRegion: { type: String, enum: ['I', 'II', 'III', 'IV', 'V'], default: 'III' },
    
    // Symptoms with weights for matching algorithm
    symptoms:            [
      {
        symptom:         { type: String, required: true },
        weight:          { type: Number, min: 1, max: 10, default: 5 },  // Distinctiveness weight
        description:     { type: String },
        affectedParts:   [{ type: String }]  // e.g., "leaves", "stem", "roots"
      }
    ],
    
    // Disease characteristics
    causes:              { type: String, default: '' },
    causativeAgent:      { type: String },  // e.g., "Fungal", "Bacterial", "Viral"
    
    favourableConditions: [
      {
        condition:       { type: String },
        description:     { type: String }
      }
    ],
    
    // Severity levels
    severity:            { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
    severityDescription: { type: String },
    
    // Management and control
    managementMeasures:  [
      {
        measure:         { type: String },
        description:     { type: String },
        timing:          { type: String }
      }
    ],
    
    preventiveMeasures:  [
      {
        measure:         { type: String },
        description:     { type: String }
      }
    ],
    
    // Impact and economic importance
    yield_loss:         { type: String },  // e.g., "10-30%"
    economicImportance: { type: String },
    
    // Reference information
    source:             { type: String, default: '' },
    reference:         { type: String, default: '' },
    sourceIds:         [{ type: String }],
    datasetName:       { type: String, default: '' },
    datasetVersion:    { type: String, default: '' },
    algorithmNote:     { type: String, default: '' },
    imageUrl:          { type: String, default: null },
    
    isActive:           { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('DiseaseKnowledge', diseaseKnowledgeSchema);
