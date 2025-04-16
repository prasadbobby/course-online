const express = require('express');
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const router = express.Router();

// Apply admin middleware to all routes
router.use(auth, roleCheck(['admin']));

// Get all users
router.get('/users', adminController.getAllUsers);

// Update user
router.put('/users/:id', adminController.updateUser);

// Get all courses
router.get('/courses', adminController.getAllCourses);

// Approve course
router.put('/courses/:id/approve', adminController.approveCourse);

// Get all payments
router.get('/payments', adminController.getAllPayments);

// Process creator payouts
router.post('/payouts', adminController.processPayouts);

// Get platform analytics
router.get('/analytics', adminController.getAnalytics);

module.exports = router;