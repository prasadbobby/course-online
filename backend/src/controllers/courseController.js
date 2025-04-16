const Course = require('../models/Course');
const Module = require('../models/Module');
const Lesson = require('../models/Lesson');
const Enrollment = require('../models/Enrollment');
const Payment = require('../models/Payment');
const Review = require('../models/Review');
const { validationResult } = require('express-validator');
const storageService = require('../services/storageService');
const paymentService = require('../services/paymentService');

// Get all published and approved courses
exports.getAllCourses = async (req, res) => {
  try {
    const { category, level, search, minPrice, maxPrice, sort } = req.query;
    
    // Build filter
    const filter = {
      isPublished: true,
      isApproved: true
    };
    
    if (category) {
      filter.category = category;
    }
    
    if (level) {
      filter.level = level;
    }
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = Number(minPrice);
      if (maxPrice !== undefined) filter.price.$lte = Number(maxPrice);
    }
    
    // Build sort
    let sortOption = {};
    if (sort === 'newest') {
      sortOption = { createdAt: -1 };
    } else if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    } else if (sort === 'price-low') {
      sortOption = { price: 1 };
    } else if (sort === 'price-high') {
      sortOption = { price: -1 };
    } else if (sort === 'rating') {
      sortOption = { 'rating.average': -1 };
    } else if (sort === 'popular') {
      sortOption = { enrolledStudents: -1 };
    } else {
      sortOption = { createdAt: -1 }; // Default sort
    }
    
    const courses = await Course.find(filter)
      .populate('creator', 'fullName profileImage')
      .sort(sortOption);
    
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get course by ID or slug
exports.getCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    
    // Check if ID is a valid MongoDB ID or a slug
    const isValidId = courseId.match(/^[0-9a-fA-F]{24}$/);
    
    let course;
    if (isValidId) {
      course = await Course.findById(courseId);
    } else {
      course = await Course.findOne({ slug: courseId });
    }
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Check if course is published and approved
    if (!course.isPublished || !course.isApproved) {
      // Check if the requester is the creator or an admin
      if (!req.user || (req.user.id.toString() !== course.creator.toString() && req.user.role !== 'admin')) {
        return res.status(403).json({ message: 'Course is not available' });
      }
    }
    
    // Get course with populated data
    course = await Course.findById(course._id)
      .populate('creator', 'fullName profileImage bio socialLinks')
      .lean();
    
    // Check if user is enrolled
    let isEnrolled = false;
    let enrollment = null;
    
    if (req.user) {
      enrollment = await Enrollment.findOne({
        userId: req.user.id,
        courseId: course._id
      });
      
      isEnrolled = !!enrollment;
    }
    
    // Get modules and preview lessons
    const modules = await Module.find({ courseId: course._id })
      .sort({ order: 1 });
    
    // Get preview lessons and count of lessons
    const lessons = await Lesson.find({
      courseId: course._id,
      isPreview: true
    }).sort({ order: 1 });
    
    // Get ratings and reviews
    const reviews = await Review.find({ courseId: course._id })
      .populate('userId', 'fullName profileImage')
      .sort({ createdAt: -1 });
    
    res.json({
      course,
      modules,
      previewLessons: lessons,
      isEnrolled,
      enrollment,
      reviews
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Enroll in a course
exports.enrollCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    
    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Check if course is published and approved
    if (!course.isPublished || !course.isApproved) {
      return res.status(403).json({ message: 'Course is not available for enrollment' });
    }
    
    // Check if user is already enrolled
    const existingEnrollment = await Enrollment.findOne({
      userId: req.user.id,
      courseId: course._id
    });
    
    if (existingEnrollment) {
      return res.status(400).json({ message: 'You are already enrolled in this course' });
    }
    
    // If course is free, create enrollment directly
    if (course.price === 0) {
      const enrollment = await Enrollment.create({
        userId: req.user.id,
        courseId: course._id,
        enrollmentDate: Date.now()
      });
      
      // Update course enrolled students count
      await Course.findByIdAndUpdate(course._id, {
        $inc: { enrolledStudents: 1 }
      });
      
      return res.status(201).json({
        message: 'Successfully enrolled in course',
        enrollment
      });
    }
    
    // If course has price, create checkout session
    const { couponCode } = req.body;
    
    let finalPrice = course.discountPrice && new Date(course.discountValidUntil) > new Date() 
      ? course.discountPrice 
      : course.price;
    
    // Apply coupon if provided (implement coupon logic separately)
    let discountAmount = 0;
    
    // Create checkout session
    const checkoutSession = await paymentService.createCheckoutSession(
      req.user.id,
      course._id,
      finalPrice,
      discountAmount,
      couponCode
    );
    
    res.status(200).json({
      message: 'Checkout session created',
      checkoutUrl: checkoutSession.url,
      sessionId: checkoutSession.id
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get course preview content
exports.getCoursePreview = async (req, res) => {
  try {
    const courseId = req.params.id;
    
    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Check if course is published and approved
    if (!course.isPublished || !course.isApproved) {
      return res.status(403).json({ message: 'Course is not available' });
    }
    
    // Get preview content
    const modules = await Module.find({ courseId: course._id })
      .sort({ order: 1 });
    
    const previewLessons = await Lesson.find({
      courseId: course._id,
      isPreview: true
    }).sort({ order: 1 });
    
    res.json({
      course: {
        id: course._id,
        title: course.title,
        description: course.description,
        thumbnail: course.thumbnail,
        price: course.price,
        discountPrice: course.discountPrice,
        discountValidUntil: course.discountValidUntil,
        level: course.level,
        whatYouWillLearn: course.whatYouWillLearn,
        requirements: course.requirements,
        totalDuration: course.totalDuration,
        totalLessons: course.totalLessons,
        rating: course.rating,
        enrolledStudents: course.enrolledStudents
      },
      modules,
      previewLessons
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add course review
exports.addCourseReview = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const courseId = req.params.id;
    const { rating, comment } = req.body;
    
    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Check if user is enrolled in the course
    const enrollment = await Enrollment.findOne({
      userId: req.user.id,
      courseId: course._id
    });
    
    if (!enrollment) {
      return res.status(403).json({ message: 'You need to be enrolled in the course to add a review' });
    }
    
    // Check if user has already reviewed this course
    const existingReview = await Review.findOne({
      userId: req.user.id,
      courseId: course._id
    });
    
    if (existingReview) {
      // Update existing review
      existingReview.rating = rating;
      existingReview.comment = comment;
      await existingReview.save();
      
      // Update course rating
      await updateCourseRating(course._id);
      
      return res.json({
        message: 'Review updated successfully',
        review: existingReview
      });
    }
    
    // Create new review
    const review = await Review.create({
      userId: req.user.id,
      courseId: course._id,
      rating,
      comment
    });
    
    // Update course rating
    await updateCourseRating(course._id);
    
    res.status(201).json({
      message: 'Review added successfully',
      review
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Helper function to update course rating
const updateCourseRating = async (courseId) => {
  const reviews = await Review.find({ courseId });
  
  if (reviews.length === 0) {
    await Course.findByIdAndUpdate(courseId, {
      'rating.average': 0,
      'rating.count': 0
    });
    return;
  }
  
  const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
  const averageRating = totalRating / reviews.length;
  
  await Course.findByIdAndUpdate(courseId, {
    'rating.average': averageRating,
    'rating.count': reviews.length
  });
};