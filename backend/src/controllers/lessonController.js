const Lesson = require('../models/Lesson');
const Course = require('../models/Course');
const Module = require('../models/Module');
const Enrollment = require('../models/Enrollment');
const { validationResult } = require('express-validator');

// Get lesson content
exports.getLesson = async (req, res) => {
  try {
    const lessonId = req.params.id;
    
    const lesson = await Lesson.findById(lessonId);
    
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }
    
    // Check if lesson is preview
    if (lesson.isPreview) {
      return res.json(lesson);
    }
    
    // Check if user is enrolled in the course
    const enrollment = await Enrollment.findOne({
      userId: req.user.id,
      courseId: lesson.courseId
    });
    
    if (!enrollment) {
      return res.status(403).json({ message: 'You need to be enrolled in the course to access this lesson' });
    }
    
    // Update last accessed lesson
    enrollment.lastAccessedLesson = lesson._id;
    enrollment.lastAccessedAt = Date.now();
    await enrollment.save();
    
    res.json(lesson);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Mark lesson as complete
exports.completeLesson = async (req, res) => {
  try {
    const lessonId = req.params.id;
    
    const lesson = await Lesson.findById(lessonId);
    
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }
    
    // Check if user is enrolled in the course
    const enrollment = await Enrollment.findOne({
      userId: req.user.id,
      courseId: lesson.courseId
    });
    
    if (!enrollment) {
      return res.status(403).json({ message: 'You need to be enrolled in the course to complete this lesson' });
    }
    
    // Check if lesson is already completed
    if (enrollment.completedLessons.includes(lessonId)) {
      return res.status(400).json({ message: 'Lesson already marked as complete' });
    }
    
    // Mark lesson as complete
    enrollment.completedLessons.push(lessonId);
    
    // Calculate progress
    const totalLessons = await Lesson.countDocuments({ courseId: lesson.courseId });
    enrollment.progress = (enrollment.completedLessons.length / totalLessons) * 100;
    
    await enrollment.save();
    
    res.json({
      message: 'Lesson marked as complete',
      enrollment
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update lesson progress (for video lessons)
exports.updateProgress = async (req, res) => {
  try {
    const { currentTime } = req.body;
    const lessonId = req.params.id;
    
    const lesson = await Lesson.findById(lessonId);
    
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }
    
    // Check if user is enrolled in the course
    const enrollment = await Enrollment.findOne({
      userId: req.user.id,
      courseId: lesson.courseId
    });
    
    if (!enrollment) {
      return res.status(403).json({ message: 'You need to be enrolled in the course to update progress' });
    }
    
    // Update last accessed lesson
    enrollment.lastAccessedLesson = lesson._id;
    enrollment.lastAccessedAt = Date.now();
    
    // If video is more than 90% complete, mark as completed
    if (lesson.type === 'video' && lesson.content.duration && 
        currentTime >= (lesson.content.duration * 0.9) && 
        !enrollment.completedLessons.includes(lessonId)) {
      
      enrollment.completedLessons.push(lessonId);
      
      // Calculate progress
      const totalLessons = await Lesson.countDocuments({ courseId: lesson.courseId });
      enrollment.progress = (enrollment.completedLessons.length / totalLessons) * 100;
    }
    
    await enrollment.save();
    
    res.json({
      message: 'Progress updated',
      enrollment
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Submit quiz answer
exports.submitQuiz = async (req, res) => {
  try {
    const { answers } = req.body;
    const lessonId = req.params.id;
    
    const lesson = await Lesson.findById(lessonId);
    
    if (!lesson || lesson.type !== 'quiz') {
      return res.status(404).json({ message: 'Quiz lesson not found' });
    }
    
    // Check if user is enrolled in the course
    const enrollment = await Enrollment.findOne({
      userId: req.user.id,
      courseId: lesson.courseId
    });
    
    if (!enrollment) {
      return res.status(403).json({ message: 'You need to be enrolled in the course to submit quiz' });
    }
    
    // Grade the quiz
    const questions = lesson.content.questions;
    let score = 0;
    const results = [];
    
    for (let i = 0; i < questions.length; i++) {
      const isCorrect = answers[i] === questions[i].correctOption;
      
      results.push({
        questionIndex: i,
        userAnswer: answers[i],
        correctAnswer: questions[i].correctOption,
        isCorrect
      });
      
      if (isCorrect) {
        score++;
      }
    }
    
    const percentage = (score / questions.length) * 100;
    
    // If score is more than 70%, mark lesson as complete
    if (percentage >= 70 && !enrollment.completedLessons.includes(lessonId)) {
      enrollment.completedLessons.push(lessonId);
      
      // Calculate progress
      const totalLessons = await Lesson.countDocuments({ courseId: lesson.courseId });
      enrollment.progress = (enrollment.completedLessons.length / totalLessons) * 100;
      
      await enrollment.save();
    }
    
    res.json({
      message: 'Quiz submitted',
      score,
      percentage,
      results,
      isPassed: percentage >= 70
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Submit assignment
exports.submitAssignment = async (req, res) => {
  try {
    const { submissionUrl, comments } = req.body;
    const lessonId = req.params.id;
    
    const lesson = await Lesson.findById(lessonId);
    
    if (!lesson || lesson.type !== 'assignment') {
      return res.status(404).json({ message: 'Assignment lesson not found' });
    }
    
    // Check if user is enrolled in the course
    const enrollment = await Enrollment.findOne({
      userId: req.user.id,
      courseId: lesson.courseId
    });
    
    if (!enrollment) {
      return res.status(403).json({ message: 'You need to be enrolled in the course to submit assignment' });
    }
    
    // Mark lesson as complete
    if (!enrollment.completedLessons.includes(lessonId)) {
      enrollment.completedLessons.push(lessonId);
      
      // Calculate progress
      const totalLessons = await Lesson.countDocuments({ courseId: lesson.courseId });
      enrollment.progress = (enrollment.completedLessons.length / totalLessons) * 100;
      
      await enrollment.save();
    }
    
    // TODO: Store assignment submission in a separate collection if needed
    
    res.json({
      message: 'Assignment submitted successfully',
      enrollment
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};