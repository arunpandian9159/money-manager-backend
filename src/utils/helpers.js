/**
 * Utility Helper Functions
 */

const { EDIT_WINDOW_HOURS } = require("../config/constants");

/**
 * Check if a transaction is within the editable time window
 * @param {Date} createdAt - Transaction creation timestamp
 * @returns {boolean} True if transaction can be edited
 */
const isWithinEditWindow = (createdAt) => {
  const now = new Date();
  const created = new Date(createdAt);
  const hoursDiff = (now - created) / (1000 * 60 * 60);
  return hoursDiff < EDIT_WINDOW_HOURS;
};

/**
 * Get remaining time in edit window
 * @param {Date} createdAt - Transaction creation timestamp
 * @returns {Object} Object with hours and minutes remaining, or null if expired
 */
const getEditWindowRemaining = (createdAt) => {
  const now = new Date();
  const created = new Date(createdAt);
  const hoursDiff = (now - created) / (1000 * 60 * 60);

  if (hoursDiff >= EDIT_WINDOW_HOURS) {
    return null;
  }

  const remainingHours = EDIT_WINDOW_HOURS - hoursDiff;
  const hours = Math.floor(remainingHours);
  const minutes = Math.floor((remainingHours - hours) * 60);

  return { hours, minutes };
};

/**
 * Build pagination object for response
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {number} total - Total items
 * @returns {Object} Pagination metadata
 */
const buildPagination = (page, limit, total) => {
  const totalPages = Math.ceil(total / limit);

  return {
    currentPage: page,
    totalPages,
    totalItems: total,
    itemsPerPage: limit,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};

/**
 * Parse date range from query parameters
 * @param {string} startDate - Start date string
 * @param {string} endDate - End date string
 * @returns {Object} Date range object for MongoDB query
 */
const parseDateRange = (startDate, endDate) => {
  const dateFilter = {};

  if (startDate) {
    dateFilter.$gte = new Date(startDate);
  }

  if (endDate) {
    // Set to end of day
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    dateFilter.$lte = end;
  }

  return Object.keys(dateFilter).length > 0 ? dateFilter : null;
};

/**
 * Format currency amount
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: USD)
 * @returns {string} Formatted currency string
 */
const formatCurrency = (amount, currency = "USD") => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
};

/**
 * Sanitize user object for response (remove sensitive fields)
 * @param {Object} user - User document
 * @returns {Object} Sanitized user object
 */
const sanitizeUser = (user) => {
  const { password, __v, ...sanitized } = user.toObject
    ? user.toObject()
    : user;
  return sanitized;
};

module.exports = {
  isWithinEditWindow,
  getEditWindowRemaining,
  buildPagination,
  parseDateRange,
  formatCurrency,
  sanitizeUser,
};
