const jwt = require('jsonwebtoken');
const User = require('../models/User');
const nasaPowerService = require('../services/nasaPowerService');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '30d' });

// @route  POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const {
      fullName, email, phone, password, district, ward, farmName, farmSize,
      soilType, location
    } = req.body;

    if (await User.findOne({ email })) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    if (location?.latitude !== null && location?.latitude !== undefined) {
      if (!nasaPowerService.isZimbabweLocation(Number(location.latitude), Number(location.longitude))) {
        return res.status(400).json({ success: false, message: 'GPS location must be within Zimbabwe boundaries' });
      }
    }

    const user = await User.create({
      fullName,
      email,
      phone,
      password,
      district,
      ward,
      farmName,
      farmSize,
      soilType,
      location: location ? { ...location, lastUpdated: new Date() } : undefined
    });

    res.status(201).json({
      success: true,
      token: generateToken(user._id),
      user,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account suspended. Contact admin.' });
    }

    res.json({
      success: true,
      token: generateToken(user._id),
      user: user.toJSON(),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  GET /api/auth/me
exports.getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

// @route  PUT /api/auth/profile
exports.updateProfile = async (req, res) => {
  try {
    const fields = ['fullName', 'phone', 'district', 'ward', 'farmName', 'farmSize', 'fcmToken'];
    const updates = {};
    fields.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  PUT /api/auth/change-password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');

    if (!(await user.matchPassword(currentPassword))) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
