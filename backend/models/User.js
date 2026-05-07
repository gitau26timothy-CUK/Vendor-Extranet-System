const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    // Basic Information
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    phone: {
      type: String,
      trim: true,
    },
    
    // Authentication
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 8,
      select: false,
    },
    
    // Role & Permissions
    role: {
      type: String,
      enum: ['Admin', 'Procurement Manager', 'Procurement Officer', 'Finance', 'Viewer'],
      default: 'Viewer',
      required: true,
    },
    department: {
      type: String,
      enum: ['Procurement', 'Finance', 'Operations', 'Management', 'IT', 'Other'],
    },
    permissions: [
      {
        type: String,
        enum: [
          'vendor.view',
          'vendor.create',
          'vendor.edit',
          'vendor.approve',
          'vendor.suspend',
          'order.view',
          'order.create',
          'order.approve',
          'analytics.view',
          'reports.generate',
          'settings.manage',
          'users.manage',
        ],
      },
    ],
    
    // Status
    status: {
      type: String,
      enum: ['Active', 'Inactive', 'Suspended'],
      default: 'Active',
    },
    
    // Profile
    avatar: String,
    bio: String,
    position: String,
    
    // Security
    lastLogin: Date,
    loginAttempts: {
      type: Number,
      default: 0,
    },
    accountLocked: {
      type: Boolean,
      default: false,
    },
    lockUntil: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    passwordChangedAt: Date,
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    twoFactorSecret: String,
    
    // Preferences
    preferences: {
      theme: {
        type: String,
        enum: ['light', 'dark', 'auto'],
        default: 'light',
      },
      language: {
        type: String,
        default: 'en',
      },
      notifications: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
        sms: { type: Boolean, default: false },
      },
      dashboardLayout: {
        type: String,
        default: 'default',
      },
    },
    
    // Activity Tracking
    lastActivity: Date,
    activityLog: [
      {
        action: String,
        timestamp: { type: Date, default: Date.now },
        ipAddress: String,
        userAgent: String,
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 10);
  this.password = await bcrypt.hash(this.password, salt);
  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to check if account is locked
userSchema.methods.isLocked = function () {
  return !!(this.accountLocked && this.lockUntil && this.lockUntil > Date.now());
};

// Method to increment login attempts
userSchema.methods.incLoginAttempts = function () {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1, accountLocked: 1 },
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  const maxAttempts = 5;
  const lockTime = 2 * 60 * 60 * 1000; // 2 hours
  
  if (this.loginAttempts + 1 >= maxAttempts && !this.isLocked()) {
    updates.$set = {
      lockUntil: Date.now() + lockTime,
      accountLocked: true,
    };
  }
  
  return this.updateOne(updates);
};

// Method to reset login attempts
userSchema.methods.resetLoginAttempts = function () {
  return this.updateOne({
    $set: { loginAttempts: 0 },
    $unset: { lockUntil: 1, accountLocked: 1 },
  });
};

// Method to check if password was changed after JWT was issued
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Method to check if user has permission
userSchema.methods.hasPermission = function (permission) {
  return this.permissions.includes(permission);
};

const User = mongoose.model('User', userSchema);

module.exports = User;

// Made with Bob
