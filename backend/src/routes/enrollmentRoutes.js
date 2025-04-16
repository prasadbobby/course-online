const express = require('express');
const enrollmentController = require('../controllers/enrollmentController');
const auth = require('../middleware/auth');
const router = express.Router();

// Get enrollment details
router.get('/:id', auth, enrollmentController.getEnrollment);

// Get course content for enrolled user
router.get('/course/:id', auth, enrollmentController.getCourseContent);

// Generate certificate
router.post('/course/:id/certificate', auth, enrollmentController.generateCertificate);

module.exports = router;