/**
 * Error Handler Middleware
 * Centralized error handling for the application
 */

const ApiError = require('../utils/ApiError');

/**
 * Handle Mongoose CastError (invalid ObjectId)
 * @param {Error} err - Mongoose CastError
 * @returns {ApiError}
 */
const handleCastError = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return ApiError.badRequest(message);
};

/**
 * Handle Mongoose Duplicate Key Error
 * @param {Error} err - Mongoose duplicate key error
 * @returns {ApiError}
 */
const handleDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const message = `${field} already exists`;
  return ApiError.conflict(message);
};

/**
 * Handle Mongoose Validation Error
 * @param {Error} err - Mongoose validation error
 * @returns {ApiError}
 */
const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Validation failed: ${errors.join('. ')}`;
  return ApiError.badRequest(message);
};

/**
 * Handle JWT Error
 * @param {Error} err - JWT error
 * @returns {ApiError}
 */
const handleJWTError = () => {
  return ApiError.unauthorized('Invalid token. Please log in again.');
};

/**
 * Handle JWT Expired Error
 * @param {Error} err - JWT expired error
 * @returns {ApiError}
 */
const handleJWTExpiredError = () => {
  return ApiError.unauthorized('Your token has expired. Please log in again.');
};

/**
 * Send error response in development
 * @param {Error} err - Error object
 * @param {Response} res - Express response object
 */
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    success: false,
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack
  });
};

/**
 * Send error response in production
 * @param {Error} err - Error object
 * @param {Response} res - Express response object
 */
const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      status: err.status,
      message: err.message
    });
  } else {
    // Programming or unknown error: don't leak error details
    console.error('ERROR 💥:', err);
    res.status(500).json({
      success: false,
      status: 'error',
      message: 'Something went wrong'
    });
  }
};

/**
 * Global Error Handler Middleware
 */
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    let error = { ...err };
    error.message = err.message;

    // Handle specific error types
    if (err.name === 'CastError') error = handleCastError(err);
    if (err.code === 11000) error = handleDuplicateKeyError(err);
    if (err.name === 'ValidationError') error = handleValidationError(err);
    if (err.name === 'JsonWebTokenError') error = handleJWTError();
    if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};

module.exports = errorHandler;

