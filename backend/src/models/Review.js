const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
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
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: String
}, { 
  timestamps: true 
});

// Compound index to prevent duplicate reviews
reviewSchema.index({ userId: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);