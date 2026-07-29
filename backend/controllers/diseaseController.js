const Disease = require('../models/Disease');

// @route GET /api/diseases
exports.getDiseases = async (req, res) => {
  try {
    const { crop } = req.query;
    const filter = crop ? { crop: new RegExp(crop, 'i') } : {};
    const diseases = await Disease.find(filter).sort({ crop: 1, diseaseName: 1 });
    res.json({ success: true, count: diseases.length, diseases });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/diseases/:id
exports.getDisease = async (req, res) => {
  try {
    const disease = await Disease.findById(req.params.id);
    if (!disease) return res.status(404).json({ success: false, message: 'Disease not found' });
    res.json({ success: true, disease });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route POST /api/diseases/identify
// Body: { crop: "Maize", symptoms: ["Yellow leaves", "Stunted growth"] }
exports.identifyDisease = async (req, res) => {
  try {
    const { crop, symptoms } = req.body;

    if (!crop || !symptoms || symptoms.length === 0) {
      return res.status(400).json({ success: false, message: 'Crop and symptoms are required' });
    }

    // Fetch all diseases for the selected crop
    const diseases = await Disease.find({ crop: new RegExp(crop, 'i') });

    // Score each disease by how many submitted symptoms it matches
    const scored = diseases.map((disease) => {
      const matchCount = symptoms.filter((s) =>
        disease.symptoms.some((ds) => ds.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(ds.toLowerCase()))
      ).length;
      const score = symptoms.length > 0 ? (matchCount / symptoms.length) * 100 : 0;
      return { disease, matchCount, score: Math.round(score) };
    });

    // Sort by score descending and only return those with at least 1 match
    const results = scored
      .filter((r) => r.matchCount > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3); // Return top 3 matches

    if (results.length === 0) {
      return res.json({
        success: true,
        message: 'No matching diseases found. Please consult an agricultural extension officer.',
        results: [],
      });
    }

    res.json({
      success: true,
      results: results.map((r) => ({
        disease: r.disease,
        matchScore: r.score,
        matchedSymptoms: r.matchCount,
      })),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route POST /api/diseases  [Admin]
exports.createDisease = async (req, res) => {
  try {
    const disease = await Disease.create(req.body);
    res.status(201).json({ success: true, disease });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route PUT /api/diseases/:id  [Admin]
exports.updateDisease = async (req, res) => {
  try {
    const disease = await Disease.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });
    if (!disease) return res.status(404).json({ success: false, message: 'Disease not found' });
    res.json({ success: true, disease });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route DELETE /api/diseases/:id  [Admin]
exports.deleteDisease = async (req, res) => {
  try {
    await Disease.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Disease deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
