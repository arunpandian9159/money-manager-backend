/**
 * Middleware Index
 * Export all middleware from a single entry point
 */

const { protect, optionalAuth } = require('./auth');
const errorHandler = require('./errorHandler');
const { authValidation, transactionValidation, accountValidation } = require('./validate');
const { apiLimiter, authLimiter, createAccountLimiter } = require('./rateLimiter');

module.exports = {
  // Auth middleware
  protect,
  optionalAuth,
  
  // Error handling
  errorHandler,
  
  // Validation
  authValidation,
  transactionValidation,
  accountValidation,
  
  // Rate limiting
  apiLimiter,
  authLimiter,
  createAccountLimiter
};

