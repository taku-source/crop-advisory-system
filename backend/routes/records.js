// records.js
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getRecords, getRecord, getRecordSummary, createRecord, updateRecord, deleteRecord,
} = require('../controllers/recordController');

router.get('/summary', protect, getRecordSummary);
router.get('/',        protect, getRecords);
router.get('/:id',     protect, getRecord);
router.post('/',       protect, createRecord);
router.put('/:id',     protect, updateRecord);
router.delete('/:id',  protect, deleteRecord);

module.exports = router;
