const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Vendor = require('../models/Vendor');
const logger = require('../config/logger');

/**
 * Generate JWT token
 */
const generateToken = (id, type) => {
  return jwt.sign({ id, type }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

/**
 * @desc    Register new user (internal staff)
 * @route   POST /api/auth/register/user
 * @access  Public (or Admin only in production)
 */
exports.registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, role, department, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      role: role || 'Viewer',
      department,
      phone,
    });

    // Generate token
    const token = generateToken(user._id, 'user');

    logger.info(`New user registered: ${email}`);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    logger.error(`User registration error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error registering user',
      error: error.message,
    });
  }
};

/**
 * @desc    Register new vendor
 * @route   POST /api/auth/register/vendor
 * @access  Public
 */
exports.registerVendor = async (req, res) => {
  try {
    const {
      companyName,
      registrationNumber,
      taxId,
      email,
      phone,
      password,
      address,
      businessType,
      industryCategory,
      contactPersons,
    } = req.body;

    // Check if vendor already exists
    const existingVendor = await Vendor.findOne({
      $or: [{ email }, { registrationNumber }],
    });

    if (existingVendor) {
      return res.status(400).json({
        success: false,
        message: 'Vendor with this email or registration number already exists',
      });
    }

    // Create vendor
    const vendor = await Vendor.create({
      companyName,
      registrationNumber,
      taxId,
      email,
      phone,
      password,
      address,
      businessType,
      industryCategory,
      contactPersons,
      status: 'Pending',
    });

    logger.info(`New vendor registered: ${companyName}`);

    res.status(201).json({
      success: true,
      message: 'Vendor registered successfully. Your account is pending approval.',
      data: {
        vendor: {
          id: vendor._id,
          companyName: vendor.companyName,
          email: vendor.email,
          status: vendor.status,
        },
      },
    });
  } catch (error) {
    logger.error(`Vendor registration error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error registering vendor',
      error: error.message,
    });
  }
};

/**
 * @desc    Login user
 * @route   POST /api/auth/login/user
 * @access  Public
 */
exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Find user and include password
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check if account is locked
    if (user.isLocked()) {
      return res.status(423).json({
        success: false,
        message: 'Account is locked due to too many failed login attempts. Please try again later.',
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      await user.incLoginAttempts();
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check if user is active
    if (user.status !== 'Active') {
      return res.status(403).json({
        success: false,
        message: 'Account is not active',
      });
    }

    // Reset login attempts and update last login
    await user.resetLoginAttempts();
    user.lastLogin = Date.now();
    await user.save();

    // Generate token
    const token = generateToken(user._id, 'user');

    logger.info(`User logged in: ${email}`);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          permissions: user.permissions,
        },
        token,
      },
    });
  } catch (error) {
    logger.error(`User login error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message,
    });
  }
};

/**
 * @desc    Login vendor
 * @route   POST /api/auth/login/vendor
 * @access  Public
 */
exports.loginVendor = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Find vendor and include password
    const vendor = await Vendor.findOne({ email }).select('+password');

    if (!vendor) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check if account is locked
    if (vendor.isLocked()) {
      return res.status(423).json({
        success: false,
        message: 'Account is locked due to too many failed login attempts. Please try again later.',
      });
    }

    // Check password
    const isPasswordValid = await vendor.comparePassword(password);

    if (!isPasswordValid) {
      await vendor.incLoginAttempts();
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check if vendor is approved
    if (vendor.status === 'Pending') {
      return res.status(403).json({
        success: false,
        message: 'Your account is pending approval',
      });
    }

    if (vendor.status === 'Rejected') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been rejected',
      });
    }

    if (vendor.status === 'Suspended') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended',
      });
    }

    // Reset login attempts and update last login
    await vendor.resetLoginAttempts();
    vendor.lastLogin = Date.now();
    await vendor.save();

    // Generate token
    const token = generateToken(vendor._id, 'vendor');

    logger.info(`Vendor logged in: ${email}`);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        vendor: {
          id: vendor._id,
          companyName: vendor.companyName,
          email: vendor.email,
          status: vendor.status,
          performanceRating: vendor.performanceRating,
        },
        token,
      },
    });
  } catch (error) {
    logger.error(`Vendor login error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error logging in',
      error: error.message,
    });
  }
};

/**
 * @desc    Get current logged in user/vendor
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = async (req, res) => {
  try {
    if (req.user) {
      res.status(200).json({
        success: true,
        data: {
          type: 'user',
          user: req.user,
        },
      });
    } else if (req.vendor) {
      res.status(200).json({
        success: true,
        data: {
          type: 'vendor',
          vendor: req.vendor,
        },
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Not authenticated',
      });
    }
  } catch (error) {
    logger.error(`Get me error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error fetching user data',
      error: error.message,
    });
  }
};

/**
 * @desc    Logout user/vendor
 * @route   POST /api/auth/logout
 * @access  Private
 */
exports.logout = async (req, res) => {
  try {
    // In a stateless JWT system, logout is handled client-side
    // But we can log the action
    if (req.user) {
      logger.info(`User logged out: ${req.user.email}`);
    } else if (req.vendor) {
      logger.info(`Vendor logged out: ${req.vendor.email}`);
    }

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    logger.error(`Logout error: ${error.message}`);
    res.status(500).json({
      success: false,
      message: 'Error logging out',
      error: error.message,
    });
  }
};

module.exports = exports;

// Made with Bob
