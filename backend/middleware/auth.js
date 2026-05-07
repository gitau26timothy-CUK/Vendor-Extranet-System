const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Vendor = require('../models/Vendor');
const logger = require('../config/logger');

/**
 * Protect routes - verify JWT token
 */
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route',
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check if user or vendor
      if (decoded.type === 'user') {
        req.user = await User.findById(decoded.id).select('-password');
        
        if (!req.user) {
          return res.status(401).json({
            success: false,
            message: 'User not found',
          });
        }

        // Check if user is active
        if (req.user.status !== 'Active') {
          return res.status(401).json({
            success: false,
            message: 'Account is not active',
          });
        }

        // Check if password was changed after token was issued
        if (req.user.changedPasswordAfter(decoded.iat)) {
          return res.status(401).json({
            success: false,
            message: 'Password recently changed. Please log in again.',
          });
        }
      } else if (decoded.type === 'vendor') {
        req.vendor = await Vendor.findById(decoded.id).select('-password');
        
        if (!req.vendor) {
          return res.status(401).json({
            success: false,
            message: 'Vendor not found',
          });
        }

        // Check if vendor is approved
        if (req.vendor.status !== 'Approved' && req.vendor.status !== 'Active') {
          return res.status(401).json({
            success: false,
            message: 'Vendor account is not approved',
          });
        }
      }

      next();
    } catch (error) {
      logger.error(`Token verification error: ${error.message}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
      });
    }
  } catch (error) {
    logger.error(`Auth middleware error: ${error.message}`);
    return res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};

/**
 * Authorize specific roles
 */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(403).json({
        success: false,
        message: 'User role not authorized to access this route',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to access this route`,
      });
    }

    next();
  };
};

/**
 * Check specific permission
 */
exports.checkPermission = (permission) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this route',
      });
    }

    if (!req.user.hasPermission(permission)) {
      return res.status(403).json({
        success: false,
        message: `You don't have permission: ${permission}`,
      });
    }

    next();
  };
};

/**
 * Vendor-only routes
 */
exports.vendorOnly = (req, res, next) => {
  if (!req.vendor) {
    return res.status(403).json({
      success: false,
      message: 'This route is only accessible to vendors',
    });
  }
  next();
};

/**
 * User-only routes
 */
exports.userOnly = (req, res, next) => {
  if (!req.user) {
    return res.status(403).json({
      success: false,
      message: 'This route is only accessible to internal users',
    });
  }
  next();
};

/**
 * Optional authentication - doesn't fail if no token
 */
exports.optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.type === 'user') {
          req.user = await User.findById(decoded.id).select('-password');
        } else if (decoded.type === 'vendor') {
          req.vendor = await Vendor.findById(decoded.id).select('-password');
        }
      } catch (error) {
        // Token invalid, but continue anyway
        logger.warn(`Optional auth token invalid: ${error.message}`);
      }
    }

    next();
  } catch (error) {
    logger.error(`Optional auth error: ${error.message}`);
    next();
  }
};

module.exports = exports;

// Made with Bob
