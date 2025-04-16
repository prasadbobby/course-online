const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  certificateNumber: {
    type: String,
    unique: true
  },
  issueDate: {
    type: Date,
    default: Date.now
  },
  certificateUrl: String
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Certificate', certificateSchema);