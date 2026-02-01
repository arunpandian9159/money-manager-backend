/**
 * Rate Limiter Middleware
 * Prevents brute force attacks on authentication endpoints
 */

const rateLimit = require("express-rate-limit");
const { RATE_LIMIT } = require("../config/constants");

/**
 * General API rate limiter
 * Limits requests to 100 per 15 minutes
 */
const apiLimiter = rateLimit({
  windowMs: RATE_LIMIT.WINDOW_MS,
  max: RATE_LIMIT.API_MAX,
  message: {
    success: false,
    message: "Too many requests, please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Auth rate limiter
 * Stricter limits for authentication endpoints
 * 5 attempts per 15 minutes (configurable via env)
 */
const authLimiter = rateLimit({
  windowMs: RATE_LIMIT.WINDOW_MS,
  max: RATE_LIMIT.MAX_ATTEMPTS,
  message: {
    success: false,
    message: "Too many login attempts, please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
});

/**
 * Create account rate limiter
 * Prevents spam account creation
 */
const createAccountLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 accounts per hour
  message: {
    success: false,
    message: "Too many accounts created, please try again later",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  apiLimiter,
  authLimiter,
  createAccountLimiter,
};
