const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const emailService = require('../services/emailService');

// ============================================
// 🔐 AUTH CONTROLLER - Improved Version
// ============================================

// Constants
const JWT_EXPIRES_IN = '30d';
const SALT_ROUNDS = 12;
const MIN_PASSWORD_LENGTH = 6;

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'lumin-secret-key',
    { expiresIn: JWT_EXPIRES_IN }
  );
};

// Format user response (DRY helper)
const formatUserResponse = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  xp: user.xp || 0,
  level: user.level || 1,
  streak: user.streak || 0,
  createdAt: user.createdAt
});

// ============================================
// 📝 REGISTER - Create new user
// ============================================
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // ✅ Input Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email and password'
      });
    }

    // ✅ Email Validation & Normalization
    const normalizedEmail = email.toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    // ✅ Password Strength Check
    if (password.length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({
        success: false,
        message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`
      });
    }

    // ✅ Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists'
      });
    }

    // ✅ Hash password with stronger salt
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, salt);

    // ✅ Create user
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword
    });

    // ✅ Generate token
    const token = generateToken(user._id);

    // ✅ Send welcome email (non-blocking)
    if (emailService && emailService.sendWelcomeEmail) {
      emailService.sendWelcomeEmail(user).catch(err => {
        console.error('[AUTH] Welcome email failed:', err.message);
      });
    }

    // ✅ Log successful registration
    console.log(`[AUTH] New user registered: ${user.email}`);

    res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: formatUserResponse(user)
    });

  } catch (error) {
    console.error('[AUTH] Register error:', error);
    
    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Registration failed. Please try again.',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
};

// ============================================
// 🔑 LOGIN - Authenticate user
// ============================================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ✅ Input Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // ✅ Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // ✅ Find user (include password for comparison)
    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // ✅ Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // ✅ Generate token
    const token = generateToken(user._id);

    // ✅ Update last login (optional - non-blocking)
    User.findByIdAndUpdate(user._id, { lastLogin: new Date() }).catch(() => {});

    // ✅ Log successful login
    console.log(`[AUTH] User logged in: ${user.email}`);

    res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: formatUserResponse(user)
    });

  } catch (error) {
    console.error('[AUTH] Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed. Please try again.',
      ...(process.env.NODE_ENV === 'development' && { error: error.message })
    });
  }
};

// ============================================
// 👤 GET ME - Get current user profile
// ============================================
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user: formatUserResponse(user)
    });

  } catch (error) {
    console.error('[AUTH] GetMe error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile'
    });
  }
};
