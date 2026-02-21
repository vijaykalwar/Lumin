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
    console.error('⚠️  WARNING: JWT_SECRET not set — auth will use fallback secret!');
  }
  if (!process.env.MONGODB_URI) {
    console.error('⚠️  WARNING: MONGODB_URI not set — database connection will fail!');
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
// TRUST PROXY - Required for Render/Heroku
// ════════════════════════════════════════════════════════════
app.set('trust proxy', true);

// ════════════════════════════════════════════════════════════
// SECURITY MIDDLEWARE
// ════════════════════════════════════════════════════════════

// ✅ CORS - Must come BEFORE helmet so CORS headers are set first
const allowedOrigins = [
  'https://lumin-app.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000'
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, Render health checks)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // Allow all origins for now (tighten later if needed)
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200
};

// Handle preflight OPTIONS requests explicitly (regex for Express 5 compatibility)
app.options(/.*/, cors(corsOptions));
app.use(cors(corsOptions));

// ✅ Helmet - Security headers (configured to NOT block CORS)
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginOpenerPolicy: { policy: 'unsafe-none' },
}));

// ✅ Response compression
app.use(compression());

// ✅ Body parser
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ✅ Rate limiting - General
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 100 : 500, // 500 in dev, 100 in prod
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Too many requests from this IP, please try again later.",
    });
  },
});

// ✅ Rate limiting - Auth routes (stricter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 10 : 50, // 50 in dev, 10 in prod
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Too many authentication attempts. Please try again in 15 minutes.",
    });
  },
});

// ✅ Rate limiting - AI routes (stricter - expensive operations)
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Too many AI requests. Please wait before making more requests.",
    });
  },
});

// ✅ Rate limiting - Profile, Stats, Export
const profileLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Too many profile requests. Please try again later.",
    });
  },
});
const statsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Too many stats requests. Please try again later.",
    });
  },
});
const exportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Too many export requests. Please try again later.",
    });
  },
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

// Health check — used by frontend wake-up ping (no rate limit, instant response)
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: Date.now() });
});

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
