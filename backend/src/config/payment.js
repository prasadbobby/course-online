const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

module.exports = {
  stripe,
  currency: 'inr', // Indian Rupees
  platformFeePercentage: 15, // 15% platform fee
  minimumPayout: 1000 // Minimum ₹1000 for creator payout
};