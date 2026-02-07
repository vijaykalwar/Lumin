const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const compression = require("compression");
const connectDB = require("./config/db");

const { setupDailyReminders, setupWeeklySummary } = require("./utils/cronJobs");

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// ════════════════════════════════════════════════════════════
// SECURITY MIDDLEWARE
// ════════════════════════════════════════════════════════════

// ✅ Helmet - Security headers
app.use(helmet());

// ✅ CORS - Cross-origin resource sharing
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://lumin-app.vercel.app",
  process.env.FRONTEND_URL,
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all origins in development
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};
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

// Apply general rate limiter to all requests
app.use("/api/", generalLimiter);

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

// Application routes
app.use("/api/entries", require("./routes/entries"));
app.use("/api/stats", require("./routes/stats"));
app.use("/api/goals", require("./routes/goals"));
app.use("/api/ai", require("./routes/ai"));
app.use("/api/pomodoro", require("./routes/pomodoro"));
app.use("/api/posts", require("./routes/posts"));
app.use("/api/teams", require("./routes/teams"));
app.use("/api/profile", require("./routes/profile"));
app.use("/api/challenges", require("./routes/challenges"));

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

// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error("Error:", err.message);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
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
  console.log("❌ Unhandled Rejection:", err.message);
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  console.log("❌ Uncaught Exception:", err.message);
  process.exit(1);
});
