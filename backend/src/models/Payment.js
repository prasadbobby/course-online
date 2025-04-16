const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
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
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'inr'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: String,
  transactionId: String,
  platformFee: Number,
  creatorPayout: Number,
  couponCode: String,
  discountAmount: Number,
  payoutProcessed: {
    type: Boolean,
    default: false
  },
  payoutDate: Date
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Payment', paymentSchema);