const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

const { setupDailyReminders, setupWeeklySummary } = require('./utils/cronJobs');
// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// ════════════════════════════════════════════════════════════
// MIDDLEWARE
// ════════════════════════════════════════════════════════════
app.use(cors());
app.use(express.json());

// Request logging (development)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

const PORT = process.env.PORT || 5000;

// ════════════════════════════════════════════════════════════
// ROUTES
// ════════════════════════════════════════════════════════════

// Auth routes
app.use('/api/auth', require('./routes/auth'));

// Entry routes (Phase 5)
app.use('/api/entries', require('./routes/entries'));
app.use('/api/stats', require('./routes/stats'));
// Add after stats route
app.use('/api/goals', require('./routes/goals'));

// AI routes
app.use('/api/ai', require('./routes/ai'));

// Pomodoro routes
app.use('/api/pomodoro', require('./routes/pomodoro'));

app.use('/api/posts', require('./routes/posts'));         
app.use('/api/teams', require('./routes/teams'));    
// Add this line with other routes
app.use('/api/profile', require('./routes/profile'));     
// Health check
app.get('/', (req, res) => {
  res.json({ 
    message: 'LUMIN Backend API',
    status: 'running',
    version: '1.0.0',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login'
      },
      entries: {
        create: 'POST /api/entries',
        getAll: 'GET /api/entries',
        getOne: 'GET /api/entries/:id',
        update: 'PUT /api/entries/:id',
        delete: 'DELETE /api/entries/:id',
        today: 'GET /api/entries/today'
      }
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// ════════════════════════════════════════════════════════════
// START SERVER
// ════════════════════════════════════════════════════════════


setupDailyReminders();
setupWeeklySummary();

app.listen(PORT, () => {
  console.log(`\n✅ Server: http://localhost:${PORT}`);
  console.log(`📦 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🗄️  Database: Connected\n`);
});


// Error handlers
process.on('unhandledRejection', (err) => {
  console.log('❌ Unhandled Rejection:', err.message);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.log('❌ Uncaught Exception:', err.message);

  process.exit(1);
  
});
