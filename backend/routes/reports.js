const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { getAdminReport, getFarmerReport } = require('../controllers/reportController');

router.get('/admin',  protect, authorize('admin'), getAdminReport);
router.get('/farmer', protect, getFarmerReport);

module.exports = router;
