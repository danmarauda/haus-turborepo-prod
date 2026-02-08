/**
 * Environment variables for Convex functions
 */
"use node";

export const env = {
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  RESEND_SENDER_EMAIL_AUTH: process.env.RESEND_SENDER_EMAIL_AUTH,
  LOOPS_FORM_ID: process.env.LOOPS_FORM_ID,

  // Stripe Payment Configuration
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  STRIPE_PRICE_ID_PREMIUM_MONTHLY: process.env.STRIPE_PRICE_ID_PREMIUM_MONTHLY,
  STRIPE_PRICE_ID_PREMIUM_YEARLY: process.env.STRIPE_PRICE_ID_PREMIUM_YEARLY,
  STRIPE_PRICE_ID_AGENCY_MONTHLY: process.env.STRIPE_PRICE_ID_AGENCY_MONTHLY,
  STRIPE_PRICE_ID_AGENCY_YEARLY: process.env.STRIPE_PRICE_ID_AGENCY_YEARLY,

  // Application URL for checkout redirects
  APP_URL: process.env.APP_URL,

  isProduction: process.env.NODE_ENV === "production",
  isDevelopment: process.env.NODE_ENV !== "production",
};
