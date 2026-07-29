const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getDiseases, getDisease, identifyDisease, createDisease, updateDisease, deleteDisease,
} = require('../controllers/diseaseController');

router.get('/',          protect, getDiseases);
router.post('/identify', protect, identifyDisease);
router.get('/:id',       protect, getDisease);
router.post('/',         protect, authorize('admin'), createDisease);
router.put('/:id',       protect, authorize('admin'), updateDisease);
router.delete('/:id',    protect, authorize('admin'), deleteDisease);

module.exports = router;
