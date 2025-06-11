import Razorpay from 'razorpay';

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  throw new Error('Razorpay credentials are not configured');
}

// Initialize Razorpay with proper mode
export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Verify webhook signature
export const verifyWebhookSignature = (
  body: string,
  signature: string,
  secret: string
): boolean => {
  const crypto = require('crypto');
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');
  return expectedSignature === signature;
};

// Helper function to check if we're in live mode
export const isLiveMode = () => {
  return process.env.RAZORPAY_KEY_ID?.startsWith('rzp_live_');
};

// Helper function to get the current mode
export const getRazorpayMode = () => {
  return isLiveMode() ? 'live' : 'test';
};

// Test mode credentials (commented out for reference)
/*
export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// Utility function to verify webhook signatures
export const verifyWebhookSignature = (
  body: string,
  signature: string,
  secret: string
) => {
  const crypto = require('crypto');
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');

  return expectedSignature === signature;
};
*/
