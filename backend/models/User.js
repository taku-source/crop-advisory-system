const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    fullName:  { type: String, required: true, trim: true },
    email:     { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone:     { type: String, required: true, trim: true },
    password:  { type: String, required: true, minlength: 6 },
    district:  { type: String, required: true },
    ward:      { type: String, default: '', trim: true },
    farmName:  { type: String, default: '' },
    farmSize:  { type: String, default: '' },
    role:      { type: String, enum: ['farmer', 'admin'], default: 'farmer' },
    isActive:  { type: Boolean, default: true },
    fcmToken:  { type: String, default: null },      // Firebase push token
    
    // Location (GPS coordinates)
    location: {
      latitude:  { type: Number, default: null },
      longitude: { type: Number, default: null },
      lastUpdated: { type: Date, default: null }
    },
    
    // Farm profile information for contextual advice
    soilType:       { type: String, default: '' },      // e.g., "Sandy loam", "Clay"
    primaryCrop:    { type: String, default: '' },
    primaryCrops:   { type: [{ type: String }], default: [], validate: { validator: (crops) => crops.length <= 3, message: 'Select no more than three crops' } },
    plantingDate:   { type: Date, default: null },
    cropSelectionDate: { type: Date, default: null },  // When farmer first selects crop after registration
    profileCompleted: { type: Boolean, default: false },
    hasSelectedCrop: { type: Boolean, default: false }, // Flag for first-login crop selection
    resetPasswordToken:   { type: String },
    resetPasswordExpires: { type: Date },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare entered password with hashed
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Check if farmer profile is complete enough for advisory generation
userSchema.methods.isAdvisoryReady = function () {
  return this.hasSelectedCrop &&
         (this.primaryCrops?.length > 0 || this.primaryCrop) &&
         this.soilType &&
         this.location &&
         this.location.latitude &&
         this.location.longitude;
};

// Remove sensitive fields from JSON output
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpires;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
