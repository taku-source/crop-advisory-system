const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const Knowledge = require('../models/Knowledge');

// GET /api/knowledge
router.get('/', protect, async (req, res) => {
  try {
    const { category, crop, search } = req.query;
    const filter = { isActive: true };
    if (category) filter.category = category;
    if (crop) filter.crop = new RegExp(crop, 'i');
    if (search) {
      filter.$or = [
        { title: new RegExp(search, 'i') },
        { content: new RegExp(search, 'i') },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }
    const articles = await Knowledge.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: articles.length, articles });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/knowledge/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const article = await Knowledge.findById(req.params.id);
    if (!article) return res.status(404).json({ success: false, message: 'Article not found' });
    res.json({ success: true, article });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/knowledge  [Admin]
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const article = await Knowledge.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, article });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/knowledge/:id  [Admin]
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const article = await Knowledge.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!article) return res.status(404).json({ success: false, message: 'Article not found' });
    res.json({ success: true, article });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DELETE /api/knowledge/:id  [Admin]
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    await Knowledge.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Article deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
