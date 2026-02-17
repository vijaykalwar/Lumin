const { body, validationResult } = require('express-validator');

/**
 * Middleware to handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path || err.param,
        message: err.msg
      }))
    });
  }
  next();
};

/**
 * Validation rules for user registration
 */
const validateRegister = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be between 2 and 50 characters'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  
  handleValidationErrors
];

/**
 * Validation rules for user login
 */
const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required'),
  
  handleValidationErrors
];

/**
 * Validation rules for entry creation
 */
const validateEntry = [
  body('mood')
    .notEmpty().withMessage('Mood is required')
    .isIn(['amazing', 'happy', 'neutral', 'sad', 'angry', 'anxious', 'stressed', 'excited'])
    .withMessage('Invalid mood value'),
  
  body('notes')
    .trim()
    .notEmpty().withMessage('Entry notes are required')
    .isLength({ min: 10, max: 5000 }).withMessage('Entry must be between 10 and 5000 characters'),
  
  body('title')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Title cannot exceed 100 characters'),
  
  body('tags')
    .optional()
    .isArray().withMessage('Tags must be an array'),
  
  handleValidationErrors
];

/**
 * Validation rules for goal creation
 */
const validateGoal = [
  body('title')
    .trim()
    .notEmpty().withMessage('Goal title is required')
    .isLength({ max: 100 }).withMessage('Title cannot exceed 100 characters'),
  
  body('description')
    .trim()
    .notEmpty().withMessage('Goal description is required')
    .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
  
  body('targetValue')
    .notEmpty().withMessage('Target value is required')
    .isNumeric().withMessage('Target value must be a number')
    .isFloat({ min: 0 }).withMessage('Target value must be positive'),
  
  body('targetDate')
    .notEmpty().withMessage('Target date is required')
    .isISO8601().withMessage('Target date must be a valid date'),
  
  body('category')
    .notEmpty().withMessage('Category is required')
    .isIn(['career', 'health', 'learning', 'finance', 'relationships', 'hobbies', 'other'])
    .withMessage('Invalid category'),
  
  handleValidationErrors
];

module.exports = {
  validateRegister,
  validateLogin,
  validateEntry,
  validateGoal,
  handleValidationErrors
};
