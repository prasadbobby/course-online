const User = require('../models/User');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const { validationResult } = require('express-validator');
const storageService = require('../services/storageService');

// Get current user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash -otpCode -otpExpire -resetPasswordToken -resetPasswordExpire');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const {
      fullName,
      mobile,
      bio,
      socialLinks
    } = req.body;
    
    const updateData = {
      fullName,
      mobile,
      bio,
      socialLinks
    };
    
    // Filter out undefined values
    Object.keys(updateData).forEach(key => 
      updateData[key] === undefined && delete updateData[key]
    );
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true }
    ).select('-passwordHash -otpCode -otpExpire -resetPasswordToken -resetPasswordExpire');
    
    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    
    const { currentPassword, newPassword } = req.body;
    
    const user = await User.findById(req.user.id);
    
    // Check if current password is correct
    const isMatch = await user.isValidPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    
    // Update password
    user.passwordHash = newPassword;
    await user.save();
    
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Upload profile image
exports.uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // Upload to S3
    const fileName = `profile-${req.user.id}-${Date.now()}`;
    const fileUrl = await storageService.uploadFile(req.file, fileName);
    
    // Update user profile
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profileImage: fileUrl },
      { new: true }
    ).select('-passwordHash -otpCode -otpExpire -resetPasswordToken -resetPasswordExpire');
    
    res.json({
      message: 'Profile image uploaded successfully',
      profileImage: fileUrl,
      user
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Apply to become a creator
exports.becomeCreator = async (req, res) => {
  try {
    if (req.user.role === 'creator') {
      return res.status(400).json({ message: 'You are already a creator' });
    }
    
    const user = await User.findById(req.user.id);
    
    user.role = 'creator';
    user.creatorStatus = 'pending';
    await user.save();
    
    res.json({
      message: 'Creator application submitted successfully',
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        creatorStatus: user.creatorStatus
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get enrolled courses
exports.getEnrolledCourses = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ userId: req.user.id })
      .populate({
        path: 'courseId',
        select: 'title slug description thumbnail creator level totalDuration totalLessons',
        populate: {
          path: 'creator',
          select: 'fullName profileImage'
        }
      })
      .sort({ enrollmentDate: -1 });
    
    res.json(enrollments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};