/**
 * ═══════════════════════════════════════════════════════════
 * 📨 STANDARDIZED API RESPONSE UTILITIES
 * ═══════════════════════════════════════════════════════════
 * 
 * Use these helpers to ensure consistent API responses across
 * all controllers.
 */

/**
 * Send a successful response
 * @param {Object} res - Express response object
 * @param {*} data - Data to return
 * @param {string} message - Optional success message
 * @param {number} statusCode - HTTP status code (default: 200)
 */
exports.sendSuccess = (res, data = null, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

/**
 * Send an error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code (default: 500)
 * @param {Object} error - Optional error details (only in development)
 */
exports.sendError = (res, message = 'An error occurred', statusCode = 500, error = null) => {
  const response = {
    success: false,
    message
  };

  // Include error details only in development
  if (process.env.NODE_ENV === 'development' && error) {
    response.error = {
      message: error.message,
      stack: error.stack
    };
  }

  return res.status(statusCode).json(response);
};

/**
 * Common error responses
 */
exports.errors = {
  // 400 Bad Request
  badRequest: (res, message = 'Invalid request') => 
    exports.sendError(res, message, 400),
  
  // 401 Unauthorized
  unauthorized: (res, message = 'Unauthorized') => 
    exports.sendError(res, message, 401),
  
  // 403 Forbidden
  forbidden: (res, message = 'Forbidden') => 
    exports.sendError(res, message, 403),
  
  // 404 Not Found
  notFound: (res, message = 'Resource not found') => 
    exports.sendError(res, message, 404),
  
  // 409 Conflict
  conflict: (res, message = 'Resource already exists') => 
    exports.sendError(res, message, 409),
  
  // 422 Unprocessable Entity
  validationError: (res, message = 'Validation failed') => 
    exports.sendError(res, message, 422),
  
  // 429 Too Many Requests
  rateLimitExceeded: (res, message = 'Too many requests') => 
    exports.sendError(res, message, 429),
  
  // 500 Internal Server Error
  serverError: (res, message = 'Server error', error = null) => 
    exports.sendError(res, message, 500, error)
};

/**
 * Example Usage:
 * 
 * const { sendSuccess, sendError, errors } = require('../utils/responseHelper');
 * 
 * // Success response
 * sendSuccess(res, userData, 'User fetched successfully');
 * 
 * // Error responses
 * errors.badRequest(res, 'Invalid email format');
 * errors.unauthorized(res);
 * errors.notFound(res, 'User not found');
 * errors.serverError(res, 'Database connection failed', error);
 * 
 * // Custom error
 * sendError(res, 'Custom error message', 418);
 */
