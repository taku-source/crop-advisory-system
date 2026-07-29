const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getAllUsers, getUser, updateUser, suspendUser, activateUser,
} = require('../controllers/userController');

router.get('/',              protect, authorize('admin'), getAllUsers);
router.get('/:id',           protect, authorize('admin'), getUser);
router.put('/:id',           protect, authorize('admin'), updateUser);
router.put('/:id/suspend',   protect, authorize('admin'), suspendUser);
router.put('/:id/activate',  protect, authorize('admin'), activateUser);

module.exports = router;
