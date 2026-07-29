const mongoose = require('mongoose');

const knowledgeSchema = new mongoose.Schema(
  {
    title:     { type: String, required: true },
    category:  {
      type: String,
      enum: ['Farming Guide', 'Best Practices', 'Disease Prevention', 'Fertilizer', 'Pest Management'],
      required: true,
    },
    content:   { type: String, required: true },
    crop:      { type: String, default: 'General' },
    tags:      [{ type: String }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isActive:  { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Knowledge', knowledgeSchema);
