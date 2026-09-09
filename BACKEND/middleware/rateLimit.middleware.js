import rateLimit from "express-rate-limit";

/**
 * Strict Rate Limiter for OTP Requests (Prevents email spamming & resource exhaustion)
 */
export const otpRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 OTP requests per windowMs
  message: {
    success: false,
    message: "Too many OTP requests from this IP. Please try again after 15 minutes.",
    error: { code: "RATE_LIMIT_EXCEEDED" },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * General API Rate Limiter
 */
export const apiRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: "Too many requests from this IP. Please slow down.",
    error: { code: "TOO_MANY_REQUESTS" },
  },
  standardHeaders: true,
  legacyHeaders: false,
});
