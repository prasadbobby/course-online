const express = require('express');
const { check } = require('express-validator');
const creatorController = require('../controllers/creatorController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
const fileUpload = require('../middleware/fileUpload');
const router = express.Router();

// Apply creator middleware to all routes
router.use(auth, roleCheck(['creator']));

// Create new course
router.post(
  '/courses',
  [
    check('title', 'Title is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty(),
    check('price', 'Price is required').isNumeric(),
    check('category', 'Category is required').not().isEmpty()
  ],
  creatorController.createCourse
);

// Update course
router.put(
  '/courses/:id',
  creatorController.updateCourse
);

// Upload course thumbnail
router.post(
  '/courses/:id/thumbnail',
  fileUpload.single('thumbnail'),
  creatorController.uploadThumbnail
);

// Get creator's courses
router.get(
  '/courses',
  creatorController.getCreatorCourses
);

// Add module to course
router.post(
  '/courses/:id/modules',
  [
    check('title', 'Title is required').not().isEmpty()
  ],
  creatorController.addModule
);

// Update module
router.put(
  '/modules/:id',
  creatorController.updateModule
);

// Delete module
router.delete(
  '/modules/:id',
  creatorController.deleteModule
);

// Add lesson to module
router.post(
  '/modules/:id/lessons',
  [
    check('title', 'Title is required').not().isEmpty(),
    check('type', 'Type is required').isIn(['video', 'text', 'quiz', 'assignment'])
  ],
  creatorController.addLesson
);

// Update lesson
router.put(
  '/lessons/:id',
  creatorController.updateLesson
);

// Delete lesson
router.delete(
  '/lessons/:id',
  creatorController.deleteLesson
);

// Upload lesson file
router.post(
  '/lessons/:id/file',
  fileUpload.single('file'),
  creatorController.uploadLessonFile
);

// Publish course
router.post(
  '/courses/:id/publish',
  creatorController.publishCourse
);

// Get creator earnings
router.get(
  '/earnings',
  creatorController.getEarnings
);

// Get course students
router.get(
  '/courses/:id/students',
  creatorController.getCourseStudents
);

module.exports = router;