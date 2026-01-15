const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ════════════════════════════════════════════════════════════
// PROTECT MIDDLEWARE - Verify JWT Token
// ════════════════════════════════════════════════════════════
/**
 * Protects routes by verifying JWT token
 * Adds user object to req.user
 */
exports.protect = async (req, res, next) => {
  try {
    let token;

    // ========== GET TOKEN FROM HEADER ==========
    // Format: "Bearer <token>"
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      // Extract token from "Bearer abc123xyz"
      token = req.headers.authorization.split(' ')[1];
    }

    // ========== CHECK TOKEN EXISTS ==========
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route. Please login.'
      });
    }

    try {
      // ========== VERIFY TOKEN ==========
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'lumin-secret-key'
      );

      // decoded = { id: 'user_id', iat: timestamp, exp: timestamp }

      // ========== GET USER FROM TOKEN ==========
      // Exclude password from user object
      req.user = await User.findById(decoded.id).select('-password');

      // ========== CHECK USER EXISTS ==========
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not found. Token invalid.'
        });
      }

      // ========== TOKEN VALID - PROCEED ==========
      next();

    } catch (error) {
      // ========== TOKEN EXPIRED OR INVALID ==========
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Invalid token. Please login again.'
        });
      }

      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token expired. Please login again.'
        });
      }

      // Generic error
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route.'
      });
    }

  } catch (error) {
    console.error('Auth Middleware Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error in authentication'
    });
  }
};

// ════════════════════════════════════════════════════════════
// OPTIONAL AUTH - For public/private routes
// ════════════════════════════════════════════════════════════
/**
 * Optionally adds user if token present
 * Does NOT reject if no token
 * Used for routes that work with/without auth
 */
exports.optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    // If no token, proceed without user
    if (!token) {
      req.user = null;
      return next();
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'lumin-secret-key'
      );

      req.user = await User.findById(decoded.id).select('-password');
      next();

    } catch (error) {
      // Token invalid but proceed anyway
      req.user = null;
      next();
    }

  } catch (error) {
    req.user = null;
    next();
  }
};

/* ════════════════════════════════════════════════════════════
   📚 AUTH MIDDLEWARE DEEP EXPLANATION:
   ════════════════════════════════════════════════════════════
   
   1. HOW JWT AUTHENTICATION WORKS:
      
      ┌─────────────────────────────────────────────────────┐
      │  STEP 1: User Logs In                               │
      │  ├─ POST /api/auth/login                            │
      │  ├─ Server verifies credentials                     │
      │  └─ Server generates JWT token                      │
      │     Token = { id: user._id, exp: 30days }           │
      │                                                      │
      │  STEP 2: User Stores Token                          │
      │  ├─ Frontend saves in localStorage                  │
      │  └─ Token: "abc123xyz456..."                        │
      │                                                      │
      │  STEP 3: User Makes Protected Request               │
      │  ├─ GET /api/entries                                │
      │  ├─ Headers: Authorization: Bearer abc123xyz...     │
      │  └─ Middleware intercepts request                   │
      │                                                      │
      │  STEP 4: Middleware Verifies Token                  │
      │  ├─ Extract token from header                       │
      │  ├─ jwt.verify(token, SECRET_KEY)                   │
      │  ├─ Get user ID from decoded token                  │
      │  ├─ Fetch user from database                        │
      │  └─ Attach user to req.user                         │
      │                                                      │
      │  STEP 5: Controller Access                          │
      │  ├─ Controller can now use req.user.id              │
      │  └─ Return user-specific data                       │
      └─────────────────────────────────────────────────────┘
   
   2. TOKEN FORMAT:
      
      Header:
      Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
                     ^^^^^^ ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                     Type   Token (base64 encoded)
      
      Token Structure (decoded):
      {
        "id": "507f1f77bcf86cd799439011",  // User ID
        "iat": 1704067200,                  // Issued at (timestamp)
        "exp": 1706745600                   // Expires at (timestamp)
      }
   
   3. SECURITY CHECKS:
      
      a) TOKEN MISSING:
         - No Authorization header
         - Return 401 Unauthorized
      
      b) TOKEN INVALID:
         - Signature doesn't match
         - Token tampered with
         - Return 401 Invalid Token
      
      c) TOKEN EXPIRED:
         - exp < current time
         - Return 401 Token Expired
      
      d) USER NOT FOUND:
         - Token valid but user deleted
         - Return 401 User Not Found
   
   4. MIDDLEWARE FLOW:
      
      Request → protect() → verify token → get user → next()
                     ↓           ↓           ↓
                   Error     Error       Error
                     ↓           ↓           ↓
                 401 Response → → → → → → → ↓
   
   5. WHY select('-password')?
      
      User.findById(id).select('-password')
                        ^^^^^^^^^^^^^^^^^
      
      - Excludes password field from result
      - Security best practice
      - Password hash never exposed in API
      
      Without select:
      {
        _id: "...",
        email: "user@example.com",
        password: "$2a$10$hashed..."  ← SECURITY RISK!
      }
      
      With select('-password'):
      {
        _id: "...",
        email: "user@example.com"
        // password field excluded ✅
      }
   
   6. OPTIONAL AUTH USE CASE:
      
      Some routes work with/without login:
      - Public profile pages
      - Community feed (logged-in users see more)
      - Home page with personalization
      
      Example:
      router.get('/feed', optionalAuth, getFeed);
      
      Controller can check:
      if (req.user) {
        // Logged in - show personalized feed
      } else {
        // Not logged in - show public feed
      }
   
   7. ERROR TYPES:
      
      a) JsonWebTokenError:
         - Token malformed
         - Invalid signature
      
      b) TokenExpiredError:
         - Token valid but expired
         - User needs to re-login
      
      c) Server Error (500):
         - Database connection failed
         - Unexpected error
   
   8. ENVIRONMENT VARIABLES:
      
      process.env.JWT_SECRET || 'lumin-secret-key'
                               ^^^^^^^^^^^^^^^^^^
                               Fallback for development
      
      Production: ALWAYS use strong secret
      Example: openssl rand -base64 32
      Result: "x8J9kLmN3pQ2rS4tU6vW8yA0bC2dE4fG5hI7jK9lM1n="
   
   9. BEST PRACTICES:
      
      ✅ DO:
      - Use strong JWT_SECRET (32+ chars)
      - Set reasonable expiry (7-30 days)
      - Exclude sensitive data from token payload
      - Always verify token on protected routes
      - Log suspicious token activities
      
      ❌ DON'T:
      - Store JWT_SECRET in code
      - Use short expiry (<1 day) - bad UX
      - Put sensitive data in token
      - Trust token without verification
   
   10. TESTING AUTH:
       
       Valid Request:
       curl -H "Authorization: Bearer abc123..." /api/entries
       → 200 OK
       
       Missing Token:
       curl /api/entries
       → 401 Not authorized
       
       Invalid Token:
       curl -H "Authorization: Bearer invalid..." /api/entries
       → 401 Invalid token
       
       Expired Token:
       curl -H "Authorization: Bearer expired..." /api/entries
       → 401 Token expired
   
   ════════════════════════════════════════════════════════════ */