const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Please add a username'],
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false, // Don't return password by default on queries
  },
  role: {
    type: String,
    enum: ['Admin', 'Manager', 'Staff'],
    default: 'Staff'
  },
  refreshToken: {
    type: String,
    select: false,
  },
  refreshTokenExpiry: {
    type: Date,
    select: false,
  },
  failedLoginAttempts: {
    type: Number,
    default: 0,
  },
  lockUntil: {
    type: Date,
  },
  resetPasswordToken: {
    type: String,
    select: false,
  },
  resetPasswordExpire: {
    type: Date,
    select: false,
  },
});

// Virtual to check if account is locked
UserSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

// Encrypt password using bcrypt before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
    return;
  }

  // Password strength requirements
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  
  // Only enforce strict password rules for new passwords (not updates)
  if (this.isNew && !passwordRegex.test(this.password)) {
    const error = new Error('Password must be at least 8 characters and contain uppercase, lowercase, number, and special character');
    return next(error);
  }

  const salt = await bcrypt.genSalt(12); // Increased salt rounds
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to match entered password to hashed password in DB
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate reset token
UserSchema.methods.getResetPasswordToken = function() {
  const resetToken = crypto.randomBytes(20).toString('hex');

  this.resetPasswordToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};

module.exports = mongoose.model('User', UserSchema);