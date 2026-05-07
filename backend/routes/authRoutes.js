const express = require('express');
const router = express.Router();
const {
  registerUser,
  registerVendor,
  loginUser,
  loginVendor,
  getMe,
  logout,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Registration routes
router.post('/register/user', registerUser);
router.post('/register/vendor', registerVendor);

// Login routes
router.post('/login/user', loginUser);
router.post('/login/vendor', loginVendor);

// Protected routes
router.get('/me', protect, getMe);
router.post('/logout', protect, logout);

module.exports = router;

// Made with Bob
