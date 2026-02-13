const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const compression = require("compression");
const connectDB = require("./config/db");
const logger = require("./utils/logger");

const { setupDailyReminders, setupWeeklySummary } = require("./utils/cronJobs");

// Load environment variables
dotenv.config();

// ════════════════════════════════════════════════════════════
// ENVIRONMENT VALIDATION
// ════════════════════════════════════════════════════════════
if (process.env.NODE_ENV === 'production') {
  if (!process.env.JWT_SECRET) {
    console.error('❌ ERROR: JWT_SECRET environment variable is required in production!');
    process.exit(1);
  }
  if (!process.env.MONGODB_URI) {
    console.error('❌ ERROR: MONGODB_URI environment variable is required in production!');
    process.exit(1);
  }
}

// ════════════════════════════════════════════════════════════
// AI SERVICE VALIDATION (Warning only - AI features optional)
// ════════════════════════════════════════════════════════════
if (!process.env.GEMINI_API_KEY) {
  console.warn('⚠️  WARNING: GEMINI_API_KEY not set. AI features will not work.');
  console.warn('   To enable AI features, add GEMINI_API_KEY to your .env file');
}

// Connect to MongoDB
connectDB();

const app = express();

// ════════════════════════════════════════════════════════════
// SECURITY MIDDLEWARE
// ════════════════════════════════════════════════════════════

// ✅ Helmet - Security headers
app.use(helmet());

// ✅ CORS - Configure based on environment
const corsOptions = {
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

if (process.env.NODE_ENV === 'production') {
  // Production: Allow specific origins
  const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
    : [];
  
  if (allowedOrigins.length === 0) {
    console.warn('⚠️  WARNING: No ALLOWED_ORIGINS set in production. Using default origin.');
    corsOptions.origin = process.env.FRONTEND_URL || 'http://localhost:3000';
  } else {
    corsOptions.origin = (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    };
  }
} else {
  // Development: Allow all origins
  corsOptions.origin = true;
}

app.use(cors(corsOptions));

// ✅ Response compression
app.use(compression());

// ✅ Body parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ✅ Rate limiting - General
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// ✅ Rate limiting - Auth routes (stricter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 login/register attempts
  message: "Too many authentication attempts, please try again later.",
  skipSuccessfulRequests: true,
});

// ✅ Rate limiting - AI routes (stricter - expensive operations)
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: "Too many AI requests. Please wait before making more requests.",
  standardHeaders: true,
  legacyHeaders: false,
});

// ✅ Rate limiting - Profile, Stats, Export
const profileLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: "Too many profile requests. Please try again later.",
  standardHeaders: true,
});
const statsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  message: "Too many stats requests. Please try again later.",
  standardHeaders: true,
});
const exportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: "Too many export requests. Please try again later.",
  standardHeaders: true,
});

// Apply general rate limiter to all requests
app.use("/api/", generalLimiter);

// Request timeout (30s)
app.use((req, res, next) => {
  req.setTimeout(30000);
  res.setTimeout(30000);
  next();
});

// Request logging (development only)
if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

const PORT = process.env.PORT || 5000;

// ════════════════════════════════════════════════════════════
// ROUTES
// ════════════════════════════════════════════════════════════

// Auth routes (with stricter rate limiting)
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/auth", require("./routes/auth"));

// AI routes (with rate limiting)
app.use("/api/ai", aiLimiter, require("./routes/ai"));

// Application routes (with rate limiters)
app.use("/api/entries", require("./routes/entries"));
app.use("/api/stats", statsLimiter, require("./routes/stats"));
app.use("/api/goals", require("./routes/goals"));
app.use("/api/pomodoro", require("./routes/pomodoro"));
app.use("/api/posts", require("./routes/posts"));
app.use("/api/teams", require("./routes/teams"));
app.use("/api/profile", profileLimiter, require("./routes/profile"));
app.use("/api/challenges", require("./routes/challenges"));
app.use("/api/export", exportLimiter, require("./routes/export"));

// Health check
app.get("/", (req, res) => {
  res.json({
    message: "LUMIN Backend API",
    status: "running",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// ✅ Global error handler (with logging)
app.use((err, req, res, next) => {
  logger.error(err.message, {
    stack: err.stack,
    url: req?.url,
    method: req?.method,
    statusCode: err.status || err.statusCode || 500,
  });

  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  const response = {
    success: false,
    message,
  };

  if (process.env.NODE_ENV === "development") {
    response.error = err.message;
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
});

// ════════════════════════════════════════════════════════════
// START SERVER
// ════════════════════════════════════════════════════════════

setupDailyReminders();
setupWeeklySummary();

app.listen(PORT, () => {
  console.log(`\n✅ Server: http://localhost:${PORT}`);
  console.log(`📦 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🗄️  Database: Connected`);
  console.log(`🔒 Security: Helmet, Rate Limiting, CORS enabled\n`);
});

// Error handlers
process.on("unhandledRejection", (err) => {
  logger.error("Unhandled Rejection", { message: err?.message, stack: err?.stack });
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception", { message: err?.message, stack: err?.stack });
  process.exit(1);
});
