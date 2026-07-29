const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getNotifications, createNotification, deleteNotification,
} = require('../controllers/notificationController');

router.get('/',       protect, getNotifications);
router.post('/',      protect, authorize('admin'), createNotification);
router.delete('/:id', protect, authorize('admin'), deleteNotification);

module.exports = router;
