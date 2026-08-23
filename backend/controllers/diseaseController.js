const Disease = require('../models/DiseaseKnowledge');

const asText = (value) => Array.isArray(value) ? value.join('; ') : (value || '');
const asMeasures = (value) => (Array.isArray(value) ? value : value ? [value] : []).map((measure) => ({
  measure: typeof measure === 'string' ? measure : measure.measure || '',
  description: typeof measure === 'string' ? measure : measure.description || '',
  timing: typeof measure === 'string' ? '' : measure.timing || ''
})).filter((measure) => measure.measure);
const asConditions = (value) => (Array.isArray(value) ? value : value ? [value] : []).map((condition) => ({
  condition: typeof condition === 'string' ? condition : condition.condition || '',
  description: typeof condition === 'string' ? condition : condition.description || ''
})).filter((condition) => condition.condition);

function normalizePayload(body) {
  return {
    ...body,
    agroEcologicalRegion: body.agroEcologicalRegion || 'III',
    symptoms: (body.symptoms || []).map((symptom) => ({
      symptom: symptom.symptom || symptom.name || symptom,
      weight: Number(symptom.weight) > 0 ? Number(symptom.weight) : 1,
      description: symptom.description || '',
      affectedParts: symptom.affectedParts || []
    })),
    causes: asText(body.causes),
    favourableConditions: asConditions(body.favourableConditions),
    managementMeasures: asMeasures(body.managementMeasures || body.management),
    preventiveMeasures: asMeasures(body.preventiveMeasures || body.prevention),
    source: body.source || body.sourceInformation?.source || '',
    reference: body.reference || body.sourceInformation?.reference || ''
  };
}

function presentDisease(disease) {
  const item = disease.toObject ? disease.toObject() : disease;
  return {
    ...item,
    description: item.description || item.severityDescription || '',
    management: item.managementMeasures || [],
    prevention: item.preventiveMeasures || []
  };
}

// @route GET /api/diseases
exports.getDiseases = async (req, res) => {
  try {
    const { crop } = req.query;
    const filter = crop ? { crop: new RegExp(crop, 'i') } : {};
    const diseases = await Disease.find({ ...filter, agroEcologicalRegion: 'III', isActive: true }).sort({ crop: 1, diseaseName: 1 });
    res.json({ success: true, count: diseases.length, diseases: diseases.map(presentDisease) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/diseases/:id
exports.getDisease = async (req, res) => {
  try {
    const disease = await Disease.findById(req.params.id);
    if (!disease) return res.status(404).json({ success: false, message: 'Disease not found' });
    res.json({ success: true, disease: presentDisease(disease) });
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

    const matcher = require('../algorithms/symptomMatcher');
    const results = await matcher.matchSymptoms(symptoms, crop);
    res.json({ success: true, crop, resultCount: results.length, results });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route POST /api/diseases  [Admin]
exports.createDisease = async (req, res) => {
  try {
    const disease = await Disease.create(normalizePayload(req.body));
    res.status(201).json({ success: true, disease: presentDisease(disease) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route PUT /api/diseases/:id  [Admin]
exports.updateDisease = async (req, res) => {
  try {
    const disease = await Disease.findByIdAndUpdate(req.params.id, normalizePayload(req.body), {
      new: true, runValidators: true,
    });
    if (!disease) return res.status(404).json({ success: false, message: 'Disease not found' });
    res.json({ success: true, disease: presentDisease(disease) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route DELETE /api/diseases/:id  [Admin]
exports.deleteDisease = async (req, res) => {
  try {
    const disease = await Disease.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!disease) return res.status(404).json({ success: false, message: 'Disease not found' });
    res.json({ success: true, message: 'Disease deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
