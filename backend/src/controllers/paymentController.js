const Payment = require('../models/Payment');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const paymentService = require('../services/paymentService');

// Create checkout session
exports.createCheckout = async (req, res) => {
  try {
    const { courseId, couponCode } = req.body;
    
    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Check if course is published and approved
    if (!course.isPublished || !course.isApproved) {
      return res.status(403).json({ message: 'Course is not available for purchase' });
    }
    
    // Check if user is already enrolled
    const existingEnrollment = await Enrollment.findOne({
      userId: req.user.id,
      courseId: course._id
    });
    
    if (existingEnrollment) {
      return res.status(400).json({ message: 'You are already enrolled in this course' });
    }
    
    // Calculate price
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

// Verify payment and complete enrollment
exports.verifyPayment = async (req, res) => {
  try {
    const { sessionId } = req.query;
    
    // Verify payment with Stripe
    const session = await paymentService.retrieveCheckoutSession(sessionId);
    
    if (!session || session.payment_status !== 'paid') {
      return res.status(400).json({ message: 'Payment not completed' });
    }
    
    // Get metadata from session
    const { userId, courseId } = session.metadata;
    
    // Check if payment already processed
    const existingPayment = await Payment.findOne({ transactionId: session.id });
    
    if (existingPayment) {
      return res.status(400).json({ message: 'Payment already processed' });
    }
    
    // Create payment record
    const payment = await Payment.create({
      userId,
      courseId,
      amount: session.amount_total / 100, // Convert from cents to rupees
      currency: session.currency,
      status: 'completed',
      paymentMethod: session.payment_method_types[0],
      transactionId: session.id,
      platformFee: (session.amount_total / 100) * 0.15, // 15% platform fee
      creatorPayout: (session.amount_total / 100) * 0.85 // 85% to creator
    });
    
    // Create enrollment
    const enrollment = await Enrollment.create({
      userId,
      courseId,
      paymentId: payment._id,
      enrollmentDate: Date.now()
    });
    
    // Update course enrolled students count
    await Course.findByIdAndUpdate(courseId, {
      $inc: { enrolledStudents: 1 }
    });
    
    res.json({
      message: 'Payment verified and enrollment completed',
      enrollment,
      payment
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Request refund
exports.requestRefund = async (req, res) => {
  try {
    const { paymentId, reason } = req.body;
    
    // Find payment
    const payment = await Payment.findById(paymentId);
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    // Check if user owns this payment
    if (payment.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to request refund for this payment' });
    }
    
    // Check if payment is eligible for refund (e.g., within 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    if (new Date(payment.createdAt) < thirtyDaysAgo) {
      return res.status(400).json({ message: 'Payment is not eligible for refund' });
    }
    
    // Check if payment is already refunded
    if (payment.status === 'refunded') {
      return res.status(400).json({ message: 'Payment already refunded' });
    }
    
    // Process refund (mark as pending, admin will handle actual refund)
    payment.status = 'pending_refund';
    await payment.save();
    
    // TODO: Create refund request record with reason
    
    res.json({
      message: 'Refund request submitted successfully',
      payment
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get payment details
exports.getPaymentDetails = async (req, res) => {
  try {
    const paymentId = req.params.id;
    
    const payment = await Payment.findById(paymentId)
      .populate('courseId', 'title thumbnail')
      .populate('userId', 'fullName email');
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    // Check if user is the owner of this payment
    if (payment.userId._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to view this payment' });
    }
    
    res.json(payment);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user payment history
exports.getPaymentHistory = async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user.id })
      .populate('courseId', 'title thumbnail')
      .sort({ createdAt: -1 });
    
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Webhook handler for Stripe events
exports.handleWebhook = async (req, res) => {
  try {
    const signature = req.headers['stripe-signature'];
    
    // Process webhook event
    const event = paymentService.constructEvent(req.body, signature);
    
    // Handle different event types
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      
      // Process the session (similar to verifyPayment)
      const { userId, courseId } = session.metadata;
      
      // Check if payment already processed
      const existingPayment = await Payment.findOne({ transactionId: session.id });
      
      if (!existingPayment) {
        // Create payment record
        const payment = await Payment.create({
          userId,
          courseId,
          amount: session.amount_total / 100,
          currency: session.currency,
          status: 'completed',
          paymentMethod: session.payment_method_types[0],
          transactionId: session.id,
          platformFee: (session.amount_total / 100) * 0.15,
          creatorPayout: (session.amount_total / 100) * 0.85
        });
        
        // Create enrollment
        await Enrollment.create({
          userId,
          courseId,
          paymentId: payment._id,
          enrollmentDate: Date.now()
        });
        
        // Update course enrolled students count
        await Course.findByIdAndUpdate(courseId, {
          $inc: { enrolledStudents: 1 }
        });
      }
    }
    
    res.json({ received: true });
  } catch (error) {
    res.status(500).json({ message: 'Webhook error', error: error.message });
  }
};