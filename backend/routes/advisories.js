const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getAdvisories, getAdvisory, createAdvisory, updateAdvisory, deleteAdvisory,
} = require('../controllers/advisoryController');

router.get('/',     protect, getAdvisories);
router.get('/:id',  protect, getAdvisory);
router.post('/',    protect, authorize('admin'), createAdvisory);
router.put('/:id',  protect, authorize('admin'), updateAdvisory);
router.delete('/:id', protect, authorize('admin'), deleteAdvisory);

module.exports = router;
