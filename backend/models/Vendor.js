const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const vendorSchema = new mongoose.Schema(
  {
    // Basic Information
    companyName: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      unique: true,
    },
    registrationNumber: {
      type: String,
      required: [true, 'Registration number is required'],
      unique: true,
      trim: true,
    },
    taxId: {
      type: String,
      required: [true, 'Tax ID is required'],
      trim: true,
    },
    
    // Contact Information
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
      required: [true, 'Phone number is required'],
      trim: true,
    },
    alternativePhone: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    
    // Address
    address: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String },
      country: { type: String, required: true, default: 'Kenya' },
      postalCode: { type: String },
    },
    
    // Authentication
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 8,
      select: false,
    },
    
    // Business Details
    businessType: {
      type: String,
      enum: ['Manufacturer', 'Distributor', 'Supplier', 'Service Provider', 'Contractor'],
      required: true,
    },
    industryCategory: {
      type: String,
      enum: [
        'Water Solutions',
        'Pumps & Motors',
        'Solar Energy',
        'Electrical Equipment',
        'Plumbing Supplies',
        'HVAC',
        'Construction Materials',
        'Industrial Equipment',
        'Other',
      ],
      required: true,
    },
    productsServices: [
      {
        name: String,
        description: String,
        category: String,
      },
    ],
    yearsInBusiness: {
      type: Number,
      min: 0,
    },
    numberOfEmployees: {
      type: Number,
      min: 1,
    },
    annualRevenue: {
      type: String,
      enum: ['< 1M', '1M - 5M', '5M - 10M', '10M - 50M', '> 50M'],
    },
    
    // Certifications & Compliance
    certifications: [
      {
        name: String,
        issuingBody: String,
        issueDate: Date,
        expiryDate: Date,
        documentUrl: String,
      },
    ],
    qualityStandards: [String],
    
    // Banking Information
    bankDetails: {
      bankName: String,
      accountName: String,
      accountNumber: String,
      swiftCode: String,
      branch: String,
    },
    
    // Vendor Status & Performance
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'Suspended', 'Active', 'Inactive'],
      default: 'Pending',
    },
    approvalDate: Date,
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    performanceRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    totalOrders: {
      type: Number,
      default: 0,
    },
    completedOrders: {
      type: Number,
      default: 0,
    },
    onTimeDeliveryRate: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    qualityScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    
    // Documents
    documents: [
      {
        name: String,
        type: {
          type: String,
          enum: [
            'Registration Certificate',
            'Tax Certificate',
            'Insurance',
            'Quality Certificate',
            'Financial Statement',
            'Other',
          ],
        },
        url: String,
        uploadDate: { type: Date, default: Date.now },
        expiryDate: Date,
        verified: { type: Boolean, default: false },
      },
    ],
    
    // Contact Persons
    contactPersons: [
      {
        name: { type: String, required: true },
        position: String,
        email: String,
        phone: String,
        isPrimary: { type: Boolean, default: false },
      },
    ],
    
    // AI-Generated Insights
    aiInsights: {
      riskScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 50,
      },
      recommendationScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 50,
      },
      predictedPerformance: String,
      strengths: [String],
      weaknesses: [String],
      lastAnalyzed: Date,
    },
    
    // Preferences & Settings
    preferences: {
      notificationEmail: { type: Boolean, default: true },
      notificationSMS: { type: Boolean, default: false },
      language: { type: String, default: 'en' },
      currency: { type: String, default: 'KES' },
    },
    
    // Metadata
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
    emailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: String,
    notes: String,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better query performance
vendorSchema.index({ email: 1 });
vendorSchema.index({ companyName: 1 });
vendorSchema.index({ status: 1 });
vendorSchema.index({ industryCategory: 1 });
vendorSchema.index({ 'aiInsights.recommendationScore': -1 });
vendorSchema.index({ performanceRating: -1 });

// Virtual for completion rate
vendorSchema.virtual('completionRate').get(function () {
  if (this.totalOrders === 0) return 0;
  return ((this.completedOrders / this.totalOrders) * 100).toFixed(2);
});

// Hash password before saving
vendorSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to compare passwords
vendorSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to check if account is locked
vendorSchema.methods.isLocked = function () {
  return !!(this.accountLocked && this.lockUntil && this.lockUntil > Date.now());
};

// Method to increment login attempts
vendorSchema.methods.incLoginAttempts = function () {
  // Reset attempts if lock has expired
  if (this.lockUntil && this.lockUntil < Date.now()) {
    return this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1, accountLocked: 1 },
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  const maxAttempts = 5;
  const lockTime = 2 * 60 * 60 * 1000; // 2 hours
  
  // Lock account after max attempts
  if (this.loginAttempts + 1 >= maxAttempts && !this.isLocked()) {
    updates.$set = {
      lockUntil: Date.now() + lockTime,
      accountLocked: true,
    };
  }
  
  return this.updateOne(updates);
};

// Method to reset login attempts
vendorSchema.methods.resetLoginAttempts = function () {
  return this.updateOne({
    $set: { loginAttempts: 0 },
    $unset: { lockUntil: 1, accountLocked: 1 },
  });
};

const Vendor = mongoose.model('Vendor', vendorSchema);

module.exports = Vendor;

// Made with Bob
