/**
 * Validation Middleware
 * Uses express-validator for request validation
 */

const { validationResult, body, param, query } = require('express-validator');
const { TRANSACTION_TYPES, DIVISIONS, CATEGORIES, ACCOUNT_TYPES, PASSWORD_CONFIG } = require('../config/constants');
const ApiError = require('../utils/ApiError');

/**
 * Handle validation errors
 * @param {Request} req - Express request
 * @param {Response} res - Express response
 * @param {Function} next - Next middleware
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(err => err.msg);
    throw ApiError.badRequest(errorMessages.join('. '));
  }
  next();
};

/**
 * Auth validation rules
 */
const authValidation = {
  register: [
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),
    body('firstName')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('First name must be between 2 and 50 characters'),
    body('lastName')
      .trim()
      .isLength({ min: 2, max: 50 })
      .withMessage('Last name must be between 2 and 50 characters'),
    body('password')
      .isLength({ min: PASSWORD_CONFIG.MIN_LENGTH })
      .withMessage(`Password must be at least ${PASSWORD_CONFIG.MIN_LENGTH} characters`),
    handleValidationErrors
  ],
  login: [
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
    handleValidationErrors
  ]
};

/**
 * Transaction validation rules
 */
const transactionValidation = {
  create: [
    body('type')
      .isIn(TRANSACTION_TYPES)
      .withMessage(`Type must be one of: ${TRANSACTION_TYPES.join(', ')}`),
    body('amount')
      .isFloat({ min: 0.01 })
      .withMessage('Amount must be at least 0.01'),
    body('category')
      .isIn(CATEGORIES)
      .withMessage(`Category must be one of: ${CATEGORIES.join(', ')}`),
    body('division')
      .isIn(DIVISIONS)
      .withMessage(`Division must be one of: ${DIVISIONS.join(', ')}`),
    body('description')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Description must be between 1 and 100 characters'),
    body('date')
      .optional()
      .isISO8601()
      .withMessage('Date must be a valid ISO 8601 date'),
    body('accountId')
      .optional()
      .isMongoId()
      .withMessage('Account ID must be a valid MongoDB ObjectId'),
    handleValidationErrors
  ],
  update: [
    param('id')
      .isMongoId()
      .withMessage('Invalid transaction ID'),
    body('type')
      .optional()
      .isIn(TRANSACTION_TYPES)
      .withMessage(`Type must be one of: ${TRANSACTION_TYPES.join(', ')}`),
    body('amount')
      .optional()
      .isFloat({ min: 0.01 })
      .withMessage('Amount must be at least 0.01'),
    body('category')
      .optional()
      .isIn(CATEGORIES)
      .withMessage(`Category must be one of: ${CATEGORIES.join(', ')}`),
    body('division')
      .optional()
      .isIn(DIVISIONS)
      .withMessage(`Division must be one of: ${DIVISIONS.join(', ')}`),
    body('description')
      .optional()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Description must be between 1 and 100 characters'),
    body('date')
      .optional()
      .isISO8601()
      .withMessage('Date must be a valid ISO 8601 date'),
    handleValidationErrors
  ],
  getById: [
    param('id')
      .isMongoId()
      .withMessage('Invalid transaction ID'),
    handleValidationErrors
  ]
};

/**
 * Account validation rules
 */
const accountValidation = {
  create: [
    body('name')
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Account name must be between 1 and 50 characters'),
    body('type')
      .isIn(ACCOUNT_TYPES)
      .withMessage(`Account type must be one of: ${ACCOUNT_TYPES.join(', ')}`),
    body('balance')
      .optional()
      .isFloat()
      .withMessage('Balance must be a number'),
    body('lastFour')
      .optional()
      .matches(/^\d{0,4}$/)
      .withMessage('Last four must be up to 4 digits'),
    handleValidationErrors
  ],
  update: [
    param('id')
      .isMongoId()
      .withMessage('Invalid account ID'),
    body('name')
      .optional()
      .trim()
      .isLength({ min: 1, max: 50 })
      .withMessage('Account name must be between 1 and 50 characters'),
    body('type')
      .optional()
      .isIn(ACCOUNT_TYPES)
      .withMessage(`Account type must be one of: ${ACCOUNT_TYPES.join(', ')}`),
    body('balance')
      .optional()
      .isFloat()
      .withMessage('Balance must be a number'),
    handleValidationErrors
  ],
  getById: [
    param('id')
      .isMongoId()
      .withMessage('Invalid account ID'),
    handleValidationErrors
  ]
};

module.exports = {
  handleValidationErrors,
  authValidation,
  transactionValidation,
  accountValidation
};

