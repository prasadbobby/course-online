const express = require('express');
const { check } = require('express-validator');
const authController = require('../controllers/authController');
const router = express.Router();

// Register user
router.post(
  '/register',
  [
    check('fullName', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password must be 6 or more characters').isLength({ min: 6 })
  ],
  authController.register
);

// Login user
router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
  ],
  authController.login
);

// Forgot password
router.post(
  '/forgot-password',
  [
    check('email', 'Please include a valid email').isEmail()
  ],
  authController.forgotPassword
);

// Reset password
router.post(
  '/reset-password',
  [
    check('token', 'Token is required').not().isEmpty(),
    check('password', 'Password must be 6 or more characters').isLength({ min: 6 })
  ],
  authController.resetPassword
);

// Send OTP
router.post(
  '/send-otp',
  [
    check('mobile', 'Mobile number is required').not().isEmpty()
  ],
  authController.sendOtp
);

// Verify OTP
router.post(
  '/verify-otp',
  [
    check('mobile', 'Mobile number is required').not().isEmpty(),
    check('otp', 'OTP is required').not().isEmpty()
  ],
  authController.verifyOtp
);

// Google OAuth
router.post('/google', authController.googleAuth);

module.exports = router;