const Advisory = require('../models/Advisory');

// @route GET /api/advisories
exports.getAdvisories = async (req, res) => {
  try {
    const { crop, upcoming } = req.query;
    const filter = { isActive: true };

    if (crop) filter.crop = new RegExp(crop, 'i');
    if (upcoming === 'true') {
      filter.recommendedDate = { $gte: new Date() };
    }

    const advisories = await Advisory.find(filter)
      .sort({ recommendedDate: 1 })
      .populate('createdBy', 'fullName');

    res.json({ success: true, count: advisories.length, advisories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/advisories/:id
exports.getAdvisory = async (req, res) => {
  try {
    const advisory = await Advisory.findById(req.params.id).populate('createdBy', 'fullName');
    if (!advisory) return res.status(404).json({ success: false, message: 'Advisory not found' });
    res.json({ success: true, advisory });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route POST /api/advisories  [Admin]
exports.createAdvisory = async (req, res) => {
  try {
    const advisory = await Advisory.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, advisory });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route PUT /api/advisories/:id  [Admin]
exports.updateAdvisory = async (req, res) => {
  try {
    const advisory = await Advisory.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });
    if (!advisory) return res.status(404).json({ success: false, message: 'Advisory not found' });
    res.json({ success: true, advisory });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route DELETE /api/advisories/:id  [Admin]
exports.deleteAdvisory = async (req, res) => {
  try {
    const advisory = await Advisory.findByIdAndDelete(req.params.id);
    if (!advisory) return res.status(404).json({ success: false, message: 'Advisory not found' });
    res.json({ success: true, message: 'Advisory deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
