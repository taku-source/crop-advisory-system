const User = require('../models/User');
const Advisory = require('../models/Advisory');
const Disease = require('../models/Disease');
const Record = require('../models/Record');
const Notification = require('../models/Notification');

// @route GET /api/reports/admin  [Admin]
exports.getAdminReport = async (req, res) => {
  try {
    const [
      totalFarmers,
      activeFarmers,
      totalAdvisories,
      totalDiseases,
      totalNotifications,
      recentFarmers,
      recordsByCategory,
    ] = await Promise.all([
      User.countDocuments({ role: 'farmer' }),
      User.countDocuments({ role: 'farmer', isActive: true }),
      Advisory.countDocuments({ isActive: true }),
      Disease.countDocuments(),
      Notification.countDocuments(),
      User.find({ role: 'farmer' }).sort({ createdAt: -1 }).limit(5).select('fullName district createdAt'),
      Record.aggregate([{ $group: { _id: '$category', count: { $sum: 1 } } }]),
    ]);

    res.json({
      success: true,
      report: {
        totalFarmers,
        activeFarmers,
        totalAdvisories,
        totalDiseases,
        totalNotifications,
        recentFarmers,
        recordsByCategory: recordsByCategory.reduce((acc, r) => { acc[r._id] = r.count; return acc; }, {}),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route GET /api/reports/farmer  [Farmer]
exports.getFarmerReport = async (req, res) => {
  try {
    const userId = req.user._id;

    const [totalRecords, byCategory, expenses, harvests] = await Promise.all([
      Record.countDocuments({ userId }),
      Record.aggregate([
        { $match: { userId } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
      ]),
      Record.aggregate([
        { $match: { userId, category: 'Expense' } },
        { $group: { _id: null, total: { $sum: '$cost' } } },
      ]),
      Record.find({ userId, category: 'Harvest' }).sort({ date: -1 }),
    ]);

    res.json({
      success: true,
      report: {
        totalRecords,
        byCategory: byCategory.reduce((acc, c) => { acc[c._id] = c.count; return acc; }, {}),
        totalExpenses: expenses[0]?.total || 0,
        harvests,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
