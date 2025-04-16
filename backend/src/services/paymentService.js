const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Payment = require('../models/Payment');

// Create checkout session
exports.createCheckoutSession = async (userId, courseId, amount, discountAmount, couponCode) => {
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'inr',
          product_data: {
            name: 'Course Enrollment',
            description: 'Enrollment fee for the course'
          },
          unit_amount: amount * 100 // in paisa (100 paisa = 1 INR)
        },
        quantity: 1
      }
    ],
    mode: 'payment',
    success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONTEND_URL}/payment/cancel`,
    metadata: {
      userId,
      courseId,
      discountAmount,
      couponCode
    }
  });
  
  return session;
};

// Retrieve checkout session
exports.retrieveCheckoutSession = async (sessionId) => {
  return await stripe.checkout.sessions.retrieve(sessionId);
};

// Create payment record
exports.createPaymentRecord = async (session) => {
  const { userId, courseId } = session.metadata;
  
  const payment = await Payment.create({
    userId,
    courseId,
    amount: session.amount_total / 100,
    currency: session.currency,
    status: 'completed',
    paymentMethod: session.payment_method_types[0],
    transactionId: session.id,
    platformFee: (session.amount_total / 100) * 0.15, // 15% platform fee
    creatorPayout: (session.amount_total / 100) * 0.85 // 85% to creator
  });
  
  return payment;
};

// Verify webhook signature
exports.constructEvent = (payload, signature) => {
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET
  );
};

// Process refund
exports.processRefund = async (paymentId) => {
  const payment = await Payment.findById(paymentId);
  
  if (!payment || payment.status !== 'completed') {
    throw new Error('Payment not found or not eligible for refund');
  }
  
  const refund = await stripe.refunds.create({
    payment_intent: payment.transactionId
  });
  
  if (refund.status === 'succeeded') {
    payment.status = 'refunded';
    await payment.save();
  }
  
  return refund;
};