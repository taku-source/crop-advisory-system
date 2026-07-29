const Record = require('../models/Record');

// @route GET /api/records
exports.getRecords = async (req, res) => {
  try {
    const { category, crop, startDate, endDate, search } = req.query;
    const filter = { userId: req.user._id };

    if (category) filter.category = category;
    if (crop) filter.crop = new RegExp(crop, 'i');
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate)   filter.date.$lte = new Date(endDate);
    }
    if (search) {
      filter.$or = [
        { crop: new RegExp(search, 'i') },
        { notes: new RegExp(search, 'i') },
        { item: new RegExp(search, 'i') },
        { productName: new RegExp(search, 'i') },
      ];
    }

    const records = await Record.find(filter).sort({ date: -1 });
    res.json({ success: true, count: records.length, records });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/records/summary
exports.getRecordSummary = async (req, res) => {
  try {
    const userId = req.user._id;

    const [totalRecords, byCategory, totalExpenses, latestHarvests] = await Promise.all([
      Record.countDocuments({ userId }),
      Record.aggregate([
        { $match: { userId } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
      ]),
      Record.aggregate([
        { $match: { userId, category: 'Expense' } },
        { $group: { _id: null, total: { $sum: '$cost' } } },
      ]),
      Record.find({ userId, category: 'Harvest' }).sort({ date: -1 }).limit(5),
    ]);

    res.json({
      success: true,
      summary: {
        totalRecords,
        byCategory: byCategory.reduce((acc, c) => { acc[c._id] = c.count; return acc; }, {}),
        totalExpenses: totalExpenses[0]?.total || 0,
        latestHarvests,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/records/:id
exports.getRecord = async (req, res) => {
  try {
    const record = await Record.findOne({ _id: req.params.id, userId: req.user._id });
    if (!record) return res.status(404).json({ success: false, message: 'Record not found' });
    res.json({ success: true, record });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route POST /api/records
exports.createRecord = async (req, res) => {
  try {
    const record = await Record.create({ ...req.body, userId: req.user._id });
    res.status(201).json({ success: true, record });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route PUT /api/records/:id
exports.updateRecord = async (req, res) => {
  try {
    const record = await Record.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!record) return res.status(404).json({ success: false, message: 'Record not found' });
    res.json({ success: true, record });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route DELETE /api/records/:id
exports.deleteRecord = async (req, res) => {
  try {
    const record = await Record.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!record) return res.status(404).json({ success: false, message: 'Record not found' });
    res.json({ success: true, message: 'Record deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
