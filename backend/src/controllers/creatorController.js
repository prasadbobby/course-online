const Course = require('../models/Course');
const Module = require('../models/Module');
const Lesson = require('../models/Lesson');
const Payment = require('../models/Payment');
const Enrollment = require('../models/Enrollment');
const Review = require('../models/Review');
const { validationResult } = require('express-validator');
const storageService = require('../services/storageService');

// Create new course
exports.createCourse = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    // Check if user is an approved creator
    if (req.user.role !== 'creator' || req.user.creatorStatus !== 'approved') {
      return res.status(403).json({ message: 'You need to be an approved creator to create courses' });
    }
    
    const {
      title,
      description,
      price,
      category,
      level,
      whatYouWillLearn,
      requirements
    } = req.body;
    
    const course = await Course.create({
      title,
      description,
      price,
      category,
      level,
      whatYouWillLearn: whatYouWillLearn || [],
      requirements: requirements || [],
      creator: req.user.id
    });
    
    res.status(201).json({
      message: 'Course created successfully',
      course
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update course
exports.updateCourse = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const courseId = req.params.id;
    
    // Find course and check ownership
    const course = await Course.findById(courseId);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    if (course.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this course' });
    }
    
    // If course is already published and approved, restrict what can be updated
    const isPublishedAndApproved = course.isPublished && course.isApproved;
    
    const {
      title,
      description,
      price,
      discountPrice,
      discountValidUntil,
      category,
      tags,
      level,
      whatYouWillLearn,
      requirements
    } = req.body;
    
    // Update allowed fields
    const updateData = {};
    
    if (!isPublishedAndApproved || !course.isPublished) {
      if (title) updateData.title = title;
      if (description) updateData.description = description;
      if (price !== undefined) updateData.price = price;
      if (category) updateData.category = category;
      if (level) updateData.level = level;
    }
    
    // These can be updated even if course is published
    if (discountPrice !== undefined) updateData.discountPrice = discountPrice;
    if (discountValidUntil) updateData.discountValidUntil = new Date(discountValidUntil);
    if (tags) updateData.tags = tags;
    if (whatYouWillLearn) updateData.whatYouWillLearn = whatYouWillLearn;
    if (requirements) updateData.requirements = requirements;
    
    const updatedCourse = await Course.findByIdAndUpdate(
      courseId,
      { $set: updateData },
      { new: true }
    );
    
    res.json({
      message: 'Course updated successfully',
      course: updatedCourse
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Upload course thumbnail
exports.uploadThumbnail = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const courseId = req.params.id;
    
    // Find course and check ownership
    const course = await Course.findById(courseId);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    if (course.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this course' });
    }
    
    // Upload to S3
    const fileName = `course-${courseId}-thumbnail-${Date.now()}`;
    const fileUrl = await storageService.uploadFile(req.file, fileName);
    
    // Update course thumbnail
    course.thumbnail = fileUrl;
    await course.save();
    
    res.json({
      message: 'Thumbnail uploaded successfully',
      thumbnail: fileUrl,
      course
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get creator's courses
exports.getCreatorCourses = async (req, res) => {
  try {
    const { status, search, sort } = req.query;
    
    // Build filter
    const filter = { creator: req.user.id };
    
    if (status === 'published') {
      filter.isPublished = true;
    } else if (status === 'draft') {
      filter.isPublished = false;
    }
    
    if (status === 'approved') {
      filter.isApproved = true;
    } else if (status === 'pending') {
      filter.isPublished = true;
      filter.isApproved = false;
    }
    
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Build sort
    let sortOption = { createdAt: -1 }; // Default sort by creation date
    
    if (sort === 'title') {
      sortOption = { title: 1 };
    } else if (sort === 'price-low') {
      sortOption = { price: 1 };
    } else if (sort === 'price-high') {
      sortOption = { price: -1 };
    } else if (sort === 'enrollments') {
      sortOption = { enrolledStudents: -1 };
    } else if (sort === 'rating') {
      sortOption = { 'rating.average': -1 };
    }
    
    const courses = await Course.find(filter).sort(sortOption);
    
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add module to course
exports.addModule = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const courseId = req.params.id;
    const { title, description } = req.body;
    
    // Find course and check ownership
    const course = await Course.findById(courseId);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    if (course.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this course' });
    }
    
    // Check if course is already published and approved
    if (course.isPublished && course.isApproved) {
      return res.status(400).json({ message: 'Cannot add modules to a published and approved course' });
    }
    
    // Get the highest order currently in the course
    const highestOrderModule = await Module.findOne({ courseId })
      .sort({ order: -1 });
    
    const newOrder = highestOrderModule ? highestOrderModule.order + 1 : 1;
    
    // Create module
    const module = await Module.create({
      courseId,
      title,
      description,
      order: newOrder
    });
    
    res.status(201).json({
      message: 'Module added successfully',
      module
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update module
exports.updateModule = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const moduleId = req.params.id;
    const { title, description, order } = req.body;
    
    // Find module
    const module = await Module.findById(moduleId);
    
    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }
    
    // Find course and check ownership
    const course = await Course.findById(module.courseId);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    if (course.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this module' });
    }
    
    // Check if course is already published and approved
    if (course.isPublished && course.isApproved) {
      return res.status(400).json({ message: 'Cannot update modules of a published and approved course' });
    }
    
    // Update module
    if (title) module.title = title;
    if (description !== undefined) module.description = description;
    if (order !== undefined) module.order = order;
    
    await module.save();
    
    res.json({
      message: 'Module updated successfully',
      module
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete module
exports.deleteModule = async (req, res) => {
  try {
    const moduleId = req.params.id;
    
    // Find module
    const module = await Module.findById(moduleId);
    
    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }
    
    // Find course and check ownership
    const course = await Course.findById(module.courseId);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    if (course.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this module' });
    }
    
    // Check if course is already published and approved
    if (course.isPublished && course.isApproved) {
      return res.status(400).json({ message: 'Cannot delete modules of a published and approved course' });
    }
    
    // Delete all lessons in the module
    await Lesson.deleteMany({ moduleId });
    
    // Delete module
    await Module.findByIdAndDelete(moduleId);
    
    res.json({
      message: 'Module and its lessons deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add lesson to module
exports.addLesson = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const moduleId = req.params.id;
    const { 
      title, 
      description, 
      type, 
      content,
      isPreview 
    } = req.body;
    
    // Find module
    const module = await Module.findById(moduleId);
    
    if (!module) {
      return res.status(404).json({ message: 'Module not found' });
    }
    
    // Find course and check ownership
    const course = await Course.findById(module.courseId);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    if (course.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to add lessons to this module' });
    }
    
    // Check if course is already published and approved
    if (course.isPublished && course.isApproved) {
      return res.status(400).json({ message: 'Cannot add lessons to a published and approved course' });
    }
    
    // Get the highest order currently in the module
    const highestOrderLesson = await Lesson.findOne({ moduleId })
      .sort({ order: -1 });
    
    const newOrder = highestOrderLesson ? highestOrderLesson.order + 1 : 1;
    
    // Create lesson
    const lesson = await Lesson.create({
      moduleId,
      courseId: module.courseId,
      title,
      description,
      type,
      content,
      order: newOrder,
      isPreview: isPreview || false
    });
    
    // Update course total lessons count
    course.totalLessons += 1;
    
    // If it's a video lesson with duration, update total duration
    if (type === 'video' && content.duration) {
      course.totalDuration += content.duration;
    }
    
    await course.save();
    
    res.status(201).json({
      message: 'Lesson added successfully',
      lesson
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update lesson
exports.updateLesson = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const lessonId = req.params.id;
    const { 
      title, 
      description, 
      content,
      isPreview,
      order
    } = req.body;
    
    // Find lesson
    const lesson = await Lesson.findById(lessonId);
    
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }
    
    // Find course and check ownership
    const course = await Course.findById(lesson.courseId);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    if (course.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this lesson' });
    }
    
    // Check if course is already published and approved
    if (course.isPublished && course.isApproved) {
      return res.status(400).json({ message: 'Cannot update lessons of a published and approved course' });
    }
    
    // If it's a video lesson and duration is being updated, adjust course total duration
    if (lesson.type === 'video' && content && content.duration !== undefined) {
      const oldDuration = lesson.content.duration || 0;
      const newDuration = content.duration || 0;
      
      course.totalDuration = course.totalDuration - oldDuration + newDuration;
      await course.save();
    }
    
    // Update lesson
    if (title) lesson.title = title;
    if (description !== undefined) lesson.description = description;
    if (content) lesson.content = { ...lesson.content, ...content };
    if (isPreview !== undefined) lesson.isPreview = isPreview;
    if (order !== undefined) lesson.order = order;
    
    await lesson.save();
    
    res.json({
      message: 'Lesson updated successfully',
      lesson
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete lesson
exports.deleteLesson = async (req, res) => {
  try {
    const lessonId = req.params.id;
    
    // Find lesson
    const lesson = await Lesson.findById(lessonId);
    
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }
    
    // Find course and check ownership
    const course = await Course.findById(lesson.courseId);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    if (course.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this lesson' });
    }
    
    // Check if course is already published and approved
    if (course.isPublished && course.isApproved) {
      return res.status(400).json({ message: 'Cannot delete lessons of a published and approved course' });
    }
    
    // Update course total lessons count
    course.totalLessons -= 1;
    
    // If it's a video lesson, update total duration
    if (lesson.type === 'video' && lesson.content.duration) {
      course.totalDuration -= lesson.content.duration;
    }
    
    await course.save();
    
    // Delete lesson
    await Lesson.findByIdAndDelete(lessonId);
    
    res.json({
      message: 'Lesson deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Upload lesson video/file
exports.uploadLessonFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    const lessonId = req.params.id;
    
    // Find lesson
    const lesson = await Lesson.findById(lessonId);
    
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }
    
    // Find course and check ownership
    const course = await Course.findById(lesson.courseId);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    if (course.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this lesson' });
    }
    
    // Check file type and lesson type compatibility
    const fileType = req.file.mimetype.split('/')[0];
    
    if (lesson.type === 'video' && fileType !== 'video') {
      return res.status(400).json({ message: 'File type does not match lesson type' });
    }
    
    // Upload to S3
    const fileName = `course-${course._id}-lesson-${lessonId}-${Date.now()}`;
    const fileUrl = await storageService.uploadFile(req.file, fileName);
    
    // Update lesson content
    if (lesson.type === 'video') {
      lesson.content.videoUrl = fileUrl;
    }
    
    await lesson.save();
    
    res.json({
      message: 'File uploaded successfully',
      fileUrl,
      lesson
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Publish course
exports.publishCourse = async (req, res) => {
  try {
    const courseId = req.params.id;
    
    // Find course
    const course = await Course.findById(courseId);
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    if (course.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to publish this course' });
    }
    
    // Validate course has necessary content before publishing
    if (!course.title || !course.description || !course.price || !course.thumbnail) {
      return res.status(400).json({ message: 'Course must have title, description, price, and thumbnail before publishing' });
    }
    
    // Check if course has at least one module
    const moduleCount = await Module.countDocuments({ courseId });
    
    if (moduleCount === 0) {
      return res.status(400).json({ message: 'Course must have at least one module before publishing' });
    }
    
    // Check if course has at least one lesson
    const lessonCount = await Lesson.countDocuments({ courseId });
    
    if (lessonCount === 0) {
      return res.status(400).json({ message: 'Course must have at least one lesson before publishing' });
    }
    
    // Mark course as published (awaiting approval)
    course.isPublished = true;
    course.isApproved = false;
    await course.save();
    
    res.json({
      message: 'Course submitted for review and publication',
      course
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get creator earnings
exports.getEarnings = async (req, res) => {
  try {
    // Get all courses by the creator
    const creatorCourses = await Course.find({ creator: req.user.id });
    const courseIds = creatorCourses.map(course => course._id);
    
    // Get completed payments for these courses
    const payments = await Payment.find({
      courseId: { $in: courseIds },
      status: 'completed'
    });
    
    // Calculate total earnings
    const totalEarnings = payments.reduce((sum, payment) => sum + payment.creatorPayout, 0);
    
    // Calculate pending payout amount (not yet processed)
// Calculate pending payout amount (not yet processed)
const pendingPayouts = await Payment.find({
    courseId: { $in: courseIds },
    status: 'completed',
    payoutProcessed: false
  });
  
  const pendingAmount = pendingPayouts.reduce((sum, payment) => sum + payment.creatorPayout, 0);
  
  // Get monthly earnings data
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  
  const monthlyPayments = await Payment.aggregate([
    {
      $match: {
        courseId: { $in: courseIds },
        status: 'completed',
        createdAt: { $gte: sixMonthsAgo }
      }
    },
    {
      $group: {
        _id: { 
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' }
        },
        totalAmount: { $sum: '$amount' },
        creatorPayout: { $sum: '$creatorPayout' },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);
  
  // Format monthly data
  const monthlyData = monthlyPayments.map(item => ({
    month: `${item._id.year}-${item._id.month}`,
    revenue: item.totalAmount,
    earnings: item.creatorPayout,
    transactions: item.count
  }));
  
  // Get course-wise earnings
  const courseEarnings = await Promise.all(
    courseIds.map(async (courseId) => {
      const course = creatorCourses.find(c => c._id.toString() === courseId.toString());
      
      const coursePayments = payments.filter(p => p.courseId.toString() === courseId.toString());
      const totalCourseEarnings = coursePayments.reduce((sum, payment) => sum + payment.creatorPayout, 0);
      
      const enrollmentCount = await Enrollment.countDocuments({ courseId });
      
      return {
        courseId,
        title: course.title,
        earnings: totalCourseEarnings,
        enrollments: enrollmentCount
      };
    })
  );
  
  res.json({
    totalEarnings,
    pendingAmount,
    courseEarnings,
    monthlyData
  });
} catch (error) {
  res.status(500).json({ message: 'Server error', error: error.message });
}
};

// Get course students
exports.getCourseStudents = async (req, res) => {
try {
  const courseId = req.params.id;
  
  // Find course and check ownership
  const course = await Course.findById(courseId);
  
  if (!course) {
    return res.status(404).json({ message: 'Course not found' });
  }
  
  if (course.creator.toString() !== req.user.id) {
    return res.status(403).json({ message: 'Not authorized to access this course data' });
  }
  
  // Get enrollments with student data
  const enrollments = await Enrollment.find({ courseId })
    .populate('userId', 'fullName email profileImage')
    .sort({ enrollmentDate: -1 });
  
  const students = enrollments.map(enrollment => ({
    id: enrollment.userId._id,
    fullName: enrollment.userId.fullName,
    email: enrollment.userId.email,
    profileImage: enrollment.userId.profileImage,
    enrollmentDate: enrollment.enrollmentDate,
    progress: enrollment.progress,
    lastAccessedAt: enrollment.lastAccessedAt
  }));
  
  res.json(students);
} catch (error) {
  res.status(500).json({ message: 'Server error', error: error.message });
}
};