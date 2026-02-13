const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const emailService = require('../services/emailService');

// ============================================
// 🔐 AUTH CONTROLLER - Improved Version
// ============================================

// Constants
const JWT_EXPIRES_IN = '7d'; // Access token - shorter for security
const REFRESH_EXPIRES_IN = '30d';
const SALT_ROUNDS = 12;
const MIN_PASSWORD_LENGTH = 8;
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;

// Generate access JWT token
const generateToken = (userId) => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret && process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET is required in production');
  }
  return jwt.sign(
    { id: userId, type: 'access' },
    jwtSecret || 'lumin-secret-key',
    { expiresIn: JWT_EXPIRES_IN }
  );
};

// Generate refresh token
const generateRefreshToken = (userId) => {
  const jwtSecret = process.env.JWT_SECRET;
  return jwt.sign(
    { id: userId, type: 'refresh' },
    jwtSecret || 'lumin-secret-key',
    { expiresIn: REFRESH_EXPIRES_IN }
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
    if (!PASSWORD_REGEX.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
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

    // ✅ Generate tokens
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    await User.findByIdAndUpdate(user._id, { refreshToken });

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
      refreshToken,
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

    // ✅ Generate tokens
    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);
    await User.findByIdAndUpdate(user._id, { refreshToken, lastLogin: new Date() }).catch(() => {});

    // ✅ Log successful login
    console.log(`[AUTH] User logged in: ${user.email}`);

    res.json({
      success: true,
      message: 'Login successful!',
      token,
      refreshToken,
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

// ============================================
// 🔄 REFRESH TOKEN - Get new access token
// ============================================
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token required'
      });
    }

    const jwtSecret = process.env.JWT_SECRET;
    const decoded = jwt.verify(token, jwtSecret || 'lumin-secret-key');
    if (decoded.type !== 'refresh') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token type'
      });
    }

    const user = await User.findById(decoded.id).select('+refreshToken');
    if (!user || user.refreshToken !== token) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token'
      });
    }

    const newAccessToken = generateToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);
    await User.findByIdAndUpdate(user._id, { refreshToken: newRefreshToken });

    res.json({
      success: true,
      token: newAccessToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Refresh token expired. Please login again.'
      });
    }
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token'
    });
  }
};
