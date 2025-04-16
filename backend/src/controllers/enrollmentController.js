const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const Lesson = require('../models/Lesson');
const Module = require('../models/Module');
const Certificate = require('../models/Certificate');
const storageService = require('../services/storageService');

// Get enrollment details
exports.getEnrollment = async (req, res) => {
  try {
    const enrollmentId = req.params.id;
    
    const enrollment = await Enrollment.findById(enrollmentId)
      .populate('courseId', 'title thumbnail creator')
      .populate('userId', 'fullName email')
      .populate('lastAccessedLesson');
    
    if (!enrollment) {
      return res.status(404).json({ message: 'Enrollment not found' });
    }
    
    // Check if user is the enrollment owner or course creator
    if (enrollment.userId._id.toString() !== req.user.id && 
        enrollment.courseId.creator.toString() !== req.user.id && 
        req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this enrollment' });
    }
    
    res.json(enrollment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get course content for enrolled user
exports.getCourseContent = async (req, res) => {
  try {
    const courseId = req.params.id;
    
    // Check if user is enrolled
    const enrollment = await Enrollment.findOne({
      userId: req.user.id,
      courseId
    });
    
    if (!enrollment) {
      return res.status(403).json({ message: 'You are not enrolled in this course' });
    }
    
    // Get course details
    const course = await Course.findById(courseId)
      .populate('creator', 'fullName profileImage bio');
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Get modules and lessons
    const modules = await Module.find({ courseId })
      .sort({ order: 1 });
    
    const lessons = await Lesson.find({ courseId })
      .sort({ order: 1 });
    
    // Group lessons by module
    const moduleWithLessons = modules.map(module => {
      const moduleLessons = lessons.filter(
        lesson => lesson.moduleId.toString() === module._id.toString()
      );
      
      return {
        ...module.toObject(),
        lessons: moduleLessons.map(lesson => ({
          ...lesson.toObject(),
          isCompleted: enrollment.completedLessons.includes(lesson._id)
        }))
      };
    });
    
    res.json({
      course,
      modules: moduleWithLessons,
      enrollment
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Generate certificate
exports.generateCertificate = async (req, res) => {
  try {
    const courseId = req.params.id;
    
    // Check if user is enrolled
    const enrollment = await Enrollment.findOne({
      userId: req.user.id,
      courseId
    });
    
    if (!enrollment) {
      return res.status(403).json({ message: 'You are not enrolled in this course' });
    }
    
    // Check if course is completed (progress is 100%)
    if (enrollment.progress < 100) {
      return res.status(400).json({ message: 'You need to complete the course to get a certificate' });
    }
    
    // Check if certificate already exists
    let certificate = await Certificate.findOne({
      userId: req.user.id,
      courseId
    });
    
    if (certificate) {
      return res.json(certificate);
    }
    
    // Get course and user details
    const course = await Course.findById(courseId)
      .populate('creator', 'fullName');
    
    // Generate certificate number
    const certificateNumber = `CERT-${Date.now()}-${req.user.id.substring(0, 6)}`;
    
    // TODO: Generate actual certificate PDF and upload to S3
    const certificateUrl = `https://example.com/certificates/${certificateNumber}.pdf`;
    
    // Create certificate record
    certificate = await Certificate.create({
      userId: req.user.id,
      courseId,
      certificateNumber,
      issueDate: Date.now(),
      certificateUrl
    });
    
    // Update enrollment record
    enrollment.certificateIssued = true;
    enrollment.certificateUrl = certificateUrl;
    await enrollment.save();
    
    res.json(certificate);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};