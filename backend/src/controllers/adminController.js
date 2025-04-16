const User = require('../models/User');
const Course = require('../models/Course');
const Payment = require('../models/Payment');
const Enrollment = require('../models/Enrollment');

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const { role, search, status, sort } = req.query;
    
    // Build filter
    const filter = {};
    
    if (role) {
      filter.role = role;
    }
    
    if (status && role === 'creator') {
      filter.creatorStatus = status;
    }
    
    if (search) {
      filter.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Build sort
    let sortOption = { createdAt: -1 }; // Default sort by creation date
    
    if (sort === 'name') {
      sortOption = { fullName: 1 };
    } else if (sort === 'email') {
      sortOption = { email: 1 };
    } else if (sort === 'oldest') {
      sortOption = { createdAt: 1 };
    } else if (sort === 'role') {
      sortOption = { role: 1 };
    }
    
    const users = await User.find(filter)
      .select('-passwordHash -otpCode -otpExpire -resetPasswordToken -resetPasswordExpire')
      .sort(sortOption);
    
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { role, creatorStatus } = req.body;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update role if provided
    if (role) {
      user.role = role;
    }
    
    // Update creator status if provided
    if (creatorStatus && user.role === 'creator') {
      user.creatorStatus = creatorStatus;
    }
    
    await user.save();
    
    res.json({
      message: 'User updated successfully',
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

// Get all courses
exports.getAllCourses = async (req, res) => {
try {
  const { status, creator, search, category, sort } = req.query;
  
  // Build filter
  const filter = {};
  
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
  
  if (creator) {
    filter.creator = creator;
  }
  
  if (category) {
    filter.category = category;
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
  
  const courses = await Course.find(filter)
    .populate('creator', 'fullName email')
    .sort(sortOption);
  
  res.json(courses);
} catch (error) {
  res.status(500).json({ message: 'Server error', error: error.message });
}
};

// Approve course
exports.approveCourse = async (req, res) => {
try {
  const courseId = req.params.id;
  const { approve } = req.body;
  
  const course = await Course.findById(courseId);
  
  if (!course) {
    return res.status(404).json({ message: 'Course not found' });
  }
  
  course.isApproved = approve;
  await course.save();
  
  res.json({
    message: approve ? 'Course approved successfully' : 'Course rejected',
    course
  });
} catch (error) {
  res.status(500).json({ message: 'Server error', error: error.message });
}
};

// Get all payments
exports.getAllPayments = async (req, res) => {
try {
  const { status, creator, dateFrom, dateTo, sort } = req.query;
  
  // Build filter
  const filter = {};
  
  if (status) {
    filter.status = status;
  }
  
  if (creator) {
    // Get courses by creator
    const creatorCourses = await Course.find({ creator });
    const courseIds = creatorCourses.map(course => course._id);
    
    filter.courseId = { $in: courseIds };
  }
  
  if (dateFrom || dateTo) {
    filter.createdAt = {};
    if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
    if (dateTo) filter.createdAt.$lte = new Date(dateTo);
  }
  
  // Build sort
  let sortOption = { createdAt: -1 }; // Default sort by date
  
  if (sort === 'amount-high') {
    sortOption = { amount: -1 };
  } else if (sort === 'amount-low') {
    sortOption = { amount: 1 };
  } else if (sort === 'oldest') {
    sortOption = { createdAt: 1 };
  }
  
  const payments = await Payment.find(filter)
    .populate('userId', 'fullName email')
    .populate('courseId', 'title')
    .sort(sortOption);
  
  res.json(payments);
} catch (error) {
  res.status(500).json({ message: 'Server error', error: error.message });
}
};

// Process creator payouts
exports.processPayouts = async (req, res) => {
try {
  const { creatorId } = req.body;
  
  // Get all courses by the creator
  const creatorCourses = await Course.find({ creator: creatorId });
  const courseIds = creatorCourses.map(course => course._id);
  
  // Get unpaid payments for these courses
  const payments = await Payment.find({
    courseId: { $in: courseIds },
    status: 'completed',
    payoutProcessed: false
  });
  
  if (payments.length === 0) {
    return res.status(400).json({ message: 'No pending payouts found' });
  }
  
  // Calculate total payout amount
  const totalPayout = payments.reduce((sum, payment) => sum + payment.creatorPayout, 0);
  
  // Mark payments as processed
  const paymentIds = payments.map(payment => payment._id);
  
  await Payment.updateMany(
    { _id: { $in: paymentIds } },
    { 
      payoutProcessed: true,
      payoutDate: Date.now()
    }
  );
  
  // TODO: Handle actual payout to creator (bank transfer, etc.)
  
  res.json({
    message: 'Payout processed successfully',
    totalPayout,
    paymentCount: payments.length
  });
} catch (error) {
  res.status(500).json({ message: 'Server error', error: error.message });
}
};

// Get platform analytics
exports.getAnalytics = async (req, res) => {
try {
  // Get total users count
  const totalUsers = await User.countDocuments();
  const totalStudents = await User.countDocuments({ role: 'student' });
  const totalCreators = await User.countDocuments({ role: 'creator' });
  
  // Get total courses count
  const totalCourses = await Course.countDocuments();
  const publishedCourses = await Course.countDocuments({ isPublished: true });
  const approvedCourses = await Course.countDocuments({ isApproved: true });
  
  // Get enrollment stats
  const totalEnrollments = await Enrollment.countDocuments();
  
  // Get payment stats
  const completedPayments = await Payment.find({ status: 'completed' });
  const totalRevenue = completedPayments.reduce((sum, payment) => sum + payment.amount, 0);
  const platformRevenue = completedPayments.reduce((sum, payment) => sum + payment.platformFee, 0);
  
  // Get monthly revenue data
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  
  const monthlyPayments = await Payment.aggregate([
    {
      $match: {
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
        platformFee: { $sum: '$platformFee' },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ]);
  
  // Format monthly data
  const monthlyData = monthlyPayments.map(item => ({
    month: `${item._id.year}-${item._id.month}`,
    revenue: item.totalAmount,
    platformRevenue: item.platformFee,
    transactions: item.count
  }));
  
  res.json({
    users: {
      total: totalUsers,
      students: totalStudents,
      creators: totalCreators
    },
    courses: {
      total: totalCourses,
      published: publishedCourses,
      approved: approvedCourses
    },
    enrollments: {
      total: totalEnrollments
    },
    revenue: {
      total: totalRevenue,
      platform: platformRevenue
    },
    monthlyData
  });
} catch (error) {
  res.status(500).json({ message: 'Server error', error: error.message });
}
};