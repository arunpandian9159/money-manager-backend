/**
 * Application Constants
 * Centralized configuration for categories, types, and other constants
 */

/**
 * Transaction types
 */
const TRANSACTION_TYPES = ["income", "expense"];

/**
 * Transaction divisions
 */
const DIVISIONS = ["office", "personal"];

/**
 * Transaction categories
 * Fixed list of 10 categories as per PRD
 */
const CATEGORIES = [
  "fuel",
  "food",
  "entertainment",
  "medical",
  "transportation",
  "loan_emi",
  "shopping",
  "utilities",
  "education",
  "others",
];

/**
 * Account types
 */
const ACCOUNT_TYPES = ["checking", "savings", "credit"];

/**
 * Edit window in hours
 * Transactions can only be edited within this time window
 */
const EDIT_WINDOW_HOURS = 12;

/**
 * Pagination defaults
 */
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};

/**
 * JWT configuration
 */
const JWT_CONFIG = {
  EXPIRE: process.env.JWT_EXPIRE || "24h",
  COOKIE_EXPIRE: 24 * 60 * 60 * 1000, // 24 hours in milliseconds
};

/**
 * Rate limiting configuration
 */
const RATE_LIMIT = {
  WINDOW_MS:
    (parseInt(process.env.RATE_LIMIT_WINDOW_MINUTES) || 15) * 60 * 1000,
  MAX_ATTEMPTS: parseInt(process.env.RATE_LIMIT_MAX) || 100,
};

/**
 * Password configuration
 */
const PASSWORD_CONFIG = {
  MIN_LENGTH: 8,
  SALT_ROUNDS: 10,
};

module.exports = {
  TRANSACTION_TYPES,
  DIVISIONS,
  CATEGORIES,
  ACCOUNT_TYPES,
  EDIT_WINDOW_HOURS,
  PAGINATION,
  JWT_CONFIG,
  RATE_LIMIT,
  PASSWORD_CONFIG,
};
