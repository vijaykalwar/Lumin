// ════════════════════════════════════════════════════════════
// STANDARDIZED ERROR RESPONSE UTILITY
// ════════════════════════════════════════════════════════════

/**
 * Standard error response format
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {Object} details - Optional error details (only in development)
 */
const sendError = (res, statusCode, message, details = null) => {
  const response = {
    success: false,
    message
  };

  // Only include error details in development
  if (details && process.env.NODE_ENV === 'development') {
    response.error = details;
  }

  return res.status(statusCode).json(response);
};

/**
 * Standard success response format
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Success message
 * @param {Object} data - Response data
 */
const sendSuccess = (res, statusCode, message, data = null) => {
  const response = {
    success: true,
    message
  };

  if (data !== null) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

/**
 * Handle async errors in controllers
 * @param {Function} fn - Async controller function
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Handle MongoDB errors
 * @param {Error} error - Error object
 * @param {Object} res - Express response object
 */
const handleMongoError = (error, res) => {
  // Duplicate key error
  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern)[0];
    return sendError(res, 400, `An account with this ${field} already exists`);
  }

  // Invalid ObjectId
  if (error.kind === 'ObjectId') {
    return sendError(res, 404, 'Resource not found');
  }

  // Validation error
  if (error.name === 'ValidationError') {
    const messages = Object.values(error.errors).map(err => err.message);
    return sendError(res, 400, messages.join(', '));
  }

  // Generic error
  return sendError(res, 500, 'Database error occurred', error.message);
};

module.exports = {
  sendError,
  sendSuccess,
  asyncHandler,
  handleMongoError
};
