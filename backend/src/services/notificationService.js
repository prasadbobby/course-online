const User = require('../models/User');
const emailService = require('./emailService');

// Send notification to users
exports.notifyUsers = async (userIds, title, message, type) => {
  // This would typically integrate with a real-time notification system
  // such as Firebase Cloud Messaging, Socket.io, etc.
  
  // For now, just send email notifications
  const users = await User.find({ _id: { $in: userIds } });
  
  for (const user of users) {
    await emailService.sendNotificationEmail(
      user.email,
      user.fullName,
      title,
      message
    );
  }
};

// Send course announcement
exports.sendCourseAnnouncement = async (courseId, title, message) => {
  // This would find all enrolled students and send them a notification
  // Implementation depends on the notification system used
};

// Send system notification to admin
exports.notifyAdmin = async (title, message) => {
  const admins = await User.find({ role: 'admin' });
  
  for (const admin of admins) {
    await emailService.sendNotificationEmail(
      admin.email,
      admin.fullName,
      title,
      message
    );
  }
};