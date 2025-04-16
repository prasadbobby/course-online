const express = require('express');
const paymentController = require('../controllers/paymentController');
const auth = require('../middleware/auth');
const router = express.Router();

// Create checkout session
router.post('/checkout', auth, paymentController.createCheckout);

// Verify payment
router.get('/verify', paymentController.verifyPayment);

// Request refund
router.post('/refund', auth, paymentController.requestRefund);

// Get payment details
router.get('/:id', auth, paymentController.getPaymentDetails);

// Get user payment history
router.get('/user/history', auth, paymentController.getPaymentHistory);

// Webhook handler
router.post('/webhook', paymentController.handleWebhook);

module.exports = router;