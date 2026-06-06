const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Never returned in queries by default
    },
    type: {
      type: String,
      enum: ['individual', 'business', 'admin'],
      default: 'individual',
    },
    company: {
      type: String,
      trim: true,
      default: '',
    },

    // ── Email Verification ──────────────────────────────────────────────────
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationToken: {
      type: String,
      default: null,
      select: false,
    },
    verificationTokenExpiry: {
      type: Date,
      default: null,
      select: false,
    },

    // ── Password Reset ──────────────────────────────────────────────────────
    resetPasswordToken: {
      type: String,
      default: null,
      select: false,
    },
    resetPasswordExpiry: {
      type: Date,
      default: null,
      select: false,
    },

    // ── Two-Factor Auth (future use) ────────────────────────────────────────
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },

    // ── Login Tracking ──────────────────────────────────────────────────────
    lastLoginAt: {
      type: Date,
      default: null,
    },
    lastLoginIP: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' },
  }
);

// Index for fast email lookup (email already has unique:true which creates an index)
userSchema.index({ resetPasswordToken: 1 });
userSchema.index({ verificationToken: 1 });

module.exports = mongoose.model('User', userSchema);
