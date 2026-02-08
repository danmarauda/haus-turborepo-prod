/**
 * Environment variables for Convex functions
 */
"use node";

export const env = {
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  RESEND_SENDER_EMAIL_AUTH: process.env.RESEND_SENDER_EMAIL_AUTH,
  LOOPS_FORM_ID: process.env.LOOPS_FORM_ID,
  isProduction: process.env.NODE_ENV === "production",
  isDevelopment: process.env.NODE_ENV !== "production",
};
