const express = require('express');
const { check } = require('express-validator');
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const fileUpload = require('../middleware/fileUpload');
const router = express.Router();

// Get current user profile
router.get('/me', auth, userController.getProfile);

// Update user profile
router.put(
  '/me',
  [
    auth,
    check('fullName', 'Name cannot be empty').optional().not().isEmpty(),
    check('mobile', 'Mobile number is not valid').optional().isMobilePhone()
  ],
  userController.updateProfile
);

// Change password
router.put(
  '/me/password',
  [
    auth,
    check('currentPassword', 'Current password is required').not().isEmpty(),
    check('newPassword', 'New password must be 6 or more characters').isLength({ min: 6 })
  ],
  userController.changePassword
);

// Upload profile image
router.post(
  '/me/profile-image',
  auth,
  fileUpload.single('image'),
  userController.uploadProfileImage
);

// Apply to become a creator
router.post('/become-creator', auth, userController.becomeCreator);

// Get enrolled courses
router.get('/me/courses', auth, userController.getEnrolledCourses);

module.exports = router;