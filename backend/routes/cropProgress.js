const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const CropProgress = require('../models/CropProgress');
const User = require('../models/User');

router.get('/', protect, async (req, res) => {
  try {
    const progress = await CropProgress.find({ userId: req.user.id, crop: req.query.crop }).sort({ completedAt: 1 });
    res.json({ success: true, progress });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.put('/:stageId', protect, async (req, res) => {
  try {
    const { crop, stageName, completed, notes = '' } = req.body;
    if (!crop || !stageName) {
      return res.status(400).json({ success: false, message: 'Crop and stage name are required' });
    }

    const filter = { userId: req.user.id, crop, stageId: req.params.stageId };
    if (completed === false) {
      await CropProgress.findOneAndDelete(filter);
      return res.json({ success: true, completed: false, stageId: req.params.stageId });
    }

    const progress = await CropProgress.findOneAndUpdate(
      filter,
      { $set: { stageName, notes, completedAt: new Date() } },
      { upsert: true, new: true, runValidators: true }
    );
    if (!req.user.plantingDate && /plant/i.test(stageName)) {
      await User.findByIdAndUpdate(req.user.id, { plantingDate: new Date() });
    }
    res.json({ success: true, completed: true, progress });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
