const express = require('express');
const { check } = require('express-validator');
const lessonController = require('../controllers/lessonController');
const auth = require('../middleware/auth');
const router = express.Router();

// Get lesson content
router.get('/:id', auth, lessonController.getLesson);

// Mark lesson as complete
router.post('/:id/complete', auth, lessonController.completeLesson);

// Update lesson progress
router.post(
  '/:id/progress',
  [
    auth,
    check('currentTime', 'Current time is required').isNumeric()
  ],
  lessonController.updateProgress
);

// Submit quiz
router.post(
  '/:id/quiz',
  [
    auth,
    check('answers', 'Answers array is required').isArray()
  ],
  lessonController.submitQuiz
);

// Submit assignment
router.post(
  '/:id/assignment',
  [
    auth,
    check('submissionUrl', 'Submission URL is required').not().isEmpty()
  ],
  lessonController.submitAssignment
);

module.exports = router;