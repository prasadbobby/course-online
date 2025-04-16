const express = require('express');
const { check } = require('express-validator');
const courseController = require('../controllers/courseController');
const auth = require('../middleware/auth');
const router = express.Router();

// Get all published courses
router.get('/', courseController.getAllCourses);

// Get course by ID or slug
router.get('/:id', courseController.getCourse);

// Enroll in a course
router.post(
  '/:id/enroll',
  auth,
  courseController.enrollCourse
);

// Get course preview content
router.get('/:id/preview', courseController.getCoursePreview);

// Add course review
router.post(
  '/:id/review',
  [
    auth,
    check('rating', 'Rating must be between 1 and 5').isInt({ min: 1, max: 5 })
  ],
  courseController.addCourseReview
);

module.exports = router;