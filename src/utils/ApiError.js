/**
 * Custom API Error Class
 * Extends Error to include HTTP status code and operational flag
 */

class ApiError extends Error {
  /**
   * Create an API Error
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   */
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }

  /**
   * Create a 400 Bad Request error
   * @param {string} message - Error message
   * @returns {ApiError}
   */
  static badRequest(message = "Bad Request") {
    return new ApiError(message, 400);
  }

  /**
   * Create a 401 Unauthorized error
   * @param {string} message - Error message
   * @returns {ApiError}
   */
  static unauthorized(message = "Unauthorized") {
    return new ApiError(message, 401);
  }

  /**
   * Create a 403 Forbidden error
   * @param {string} message - Error message
   * @returns {ApiError}
   */
  static forbidden(message = "Forbidden") {
    return new ApiError(message, 403);
  }

  /**
   * Create a 404 Not Found error
   * @param {string} message - Error message
   * @returns {ApiError}
   */
  static notFound(message = "Resource not found") {
    return new ApiError(message, 404);
  }

  /**
   * Create a 409 Conflict error
   * @param {string} message - Error message
   * @returns {ApiError}
   */
  static conflict(message = "Resource already exists") {
    return new ApiError(message, 409);
  }

  /**
   * Create a 422 Unprocessable Entity error
   * @param {string} message - Error message
   * @returns {ApiError}
   */
  static unprocessable(message = "Unprocessable Entity") {
    return new ApiError(message, 422);
  }

  /**
   * Create a 500 Internal Server Error
   * @param {string} message - Error message
   * @returns {ApiError}
   */
  static internal(message = "Internal Server Error") {
    return new ApiError(message, 500);
  }
}

module.exports = ApiError;
