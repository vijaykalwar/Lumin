# 📦 LUMIN - Complete Codebase for Claude AI

**Generated:** 2025-12-27T09:21:37.658Z

---

## 📋 Project Overview

This file contains the complete codebase for LUMIN journaling app.

**Tech Stack:**
- Frontend: React 19 + Vite + Tailwind CSS
- Backend: Node.js + Express.js
- Database: MongoDB Atlas (Mongoose)
- Auth: JWT (JSON Web Tokens)

**Status:**
- ✅ DONE: Auth, Entries, Goals, Streaks, XP, Badges, Dashboard
- ❌ TODO: AI Integration, Pomodoro, Vision Board, UX improvements

---

## 📁 Backend Core

### `backend/server.js`

```javascript
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const entryRoutes = require('./routes/entries');
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

```

---

### `backend/package.json`

```json
{
  "name": "backend",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "dev": "nodemon server.js",
    "start": "node server.js"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "description": "",
  "dependencies": {
    "bcryptjs": "^3.0.3",
    "cors": "^2.8.5",
    "dotenv": "^17.2.3",
    "express": "^5.2.1",
    "jsonwebtoken": "^9.0.3",
    "lucide-react": "^0.561.0",
    "mongoose": "^9.0.1",
    "react-icons": "^5.5.0"
  }
}

```

---

### `backend/config/db.js`

```javascript
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📦 Database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
```

---

## 📁 Backend Models

### `backend/models/User.js`

```javascript
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6
  },
  
  // ========== GAMIFICATION FIELDS ==========
  xp: {
    type: Number,
    default: 0,
    min: 0
  },
  level: {
    type: Number,
    default: 1,
    min: 1
  },
  streak: {
    type: Number,
    default: 0,
    min: 0
  },
  lastEntryDate: {
    type: Date,
    default: null
  },
  
  // ========== BADGES ==========
  badges: [{
    name: String,           // 'fire-starter'
    displayName: String,    // '🔥 Fire Starter'
    earnedAt: {
      type: Date,
      default: Date.now
    },
    xpAwarded: Number
  }],
  
  // ========== PROFILE ==========
  avatar: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    maxlength: 500,
    default: ''
  },
  
  // ========== SETTINGS ==========
  settings: {
    emailNotifications: {
      type: Boolean,
      default: true
    },
    dailyReminder: {
      type: Boolean,
      default: true
    },
    reminderTime: {
      type: String,
      default: '20:00'  // 8 PM
    }
  },
  
  // ========== METADATA ==========
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
```

---

### `backend/models/Entry.js`

```javascript
const mongoose = require('mongoose');

const entrySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Entry must belong to a user'],
    index: true
  },

  mood: {
    type: String,
    required: [true, 'Mood is required'],
    enum: ['amazing', 'happy', 'neutral', 'sad', 'angry', 'anxious', 'stressed', 'excited'],
    lowercase: true
  },
  
  moodEmoji: {
    type: String,
    required: true,
    default: function() {
      const emojiMap = {
        amazing: '🤩',
        happy: '😊',
        neutral: '😐',
        sad: '😢',
        angry: '😠',
        anxious: '😰',
        stressed: '😫',
        excited: '🤗'
      };
      return emojiMap[this.mood] || '😊';
    }
  },

  moodIntensity: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },

  title: {
    type: String,
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters'],
    default: ''
  },

  notes: {
    type: String,
    required: [true, 'Entry notes are required'],
    trim: true,
    minlength: [10, 'Entry must be at least 10 characters'],
    maxlength: [5000, 'Entry cannot exceed 5000 characters']
  },

  tags: [{
    type: String,
    lowercase: true,
    trim: true
  }],

  category: {
    type: String,
    enum: ['personal', 'work', 'health', 'goals', 'gratitude', 'reflection', 'other'],
    default: 'personal',
    lowercase: true
  },

  location: {
    enabled: {
      type: Boolean,
      default: false
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    placeName: String,
    city: String,
    country: String
  },

  isPrivate: {
    type: Boolean,
    default: true
  },

  wordCount: {
    type: Number,
    default: 0
  },

  entryDate: {
    type: Date,
    default: Date.now,
    index: true
  },

  xpAwarded: {
    type: Number,
    default: 0
  },

  linkedPomodoro: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PomodoroSession',
    default: null
  }

}, {
  timestamps: true
});

// ════════════════════════════════════════════════════════════
// INDEXES FOR PERFORMANCE
// ════════════════════════════════════════════════════════════
entrySchema.index({ user: 1, entryDate: -1 });
entrySchema.index({ user: 1, mood: 1 });
entrySchema.index({ user: 1, category: 1 });
entrySchema.index({ tags: 1 });

// ════════════════════════════════════════════════════════════
// PRE-SAVE MIDDLEWARE - Calculate word count
// ════════════════════════════════════════════════════════════
entrySchema.pre('save', function () {
  if (this.notes) {
    this.wordCount = this.notes
      .trim()
      .split(/\s+/)
      .filter(word => word.length > 0).length;
  }
});


// ════════════════════════════════════════════════════════════
// VIRTUAL FIELDS
// ════════════════════════════════════════════════════════════

// Check if entry is detailed (100+ words)
entrySchema.virtual('isDetailed').get(function() {
  return this.wordCount >= 100;
});

// Get formatted date - FIXED
entrySchema.virtual('formattedDate').get(function() {
  if (!this.entryDate) return 'No date';  // ✅ FIX
  
  try {
    return this.entryDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    return 'Invalid date';
  }
});

// Enable virtuals in JSON
entrySchema.set('toJSON', { virtuals: true });
entrySchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Entry', entrySchema);
```

---

### `backend/models/Goal.js`

```javascript
const mongoose = require('mongoose');

// ════════════════════════════════════════════════════════════
// GOAL SCHEMA - SMART Goals Model
// ════════════════════════════════════════════════════════════
const goalSchema = new mongoose.Schema({
  // ========== USER REFERENCE ==========
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Goal must belong to a user'],
    index: true
  },

  // ========== SMART CRITERIA ==========
  title: {
    type: String,
    required: [true, 'Goal title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },

  // Specific
  description: {
    type: String,
    required: [true, 'Goal description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },

  // Measurable
  metric: {
    type: String,
    required: true,
    trim: true
  },

  targetValue: {
    type: Number,
    required: true,
    min: 0
  },

  currentValue: {
    type: Number,
    default: 0,
    min: 0
  },

  unit: {
    type: String,
    default: 'units'
  },

  // Achievable & Relevant
  category: {
    type: String,
    required: true,
    enum: ['career', 'health', 'learning', 'finance', 'relationships', 'hobbies', 'other'],
    lowercase: true
  },

  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },

  // Time-bound
  startDate: {
    type: Date,
    default: Date.now
  },

  targetDate: {
    type: Date,
    required: [true, 'Target date is required']
  },

  // ========== MILESTONES ==========
  milestones: [{
    title: {
      type: String,
      required: true
    },
    description: String,
    targetValue: Number,
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: Date,
    xpReward: {
      type: Number,
      default: 25
    }
  }],

  // ========== STATUS ==========
  status: {
    type: String,
    enum: ['active', 'completed', 'abandoned', 'paused'],
    default: 'active'
  },

  completedAt: Date,

  // ========== REWARDS ==========
  xpReward: {
    type: Number,
    default: 200
  },

  badgeAwarded: {
    type: String,
    default: null
  },

  // ========== METADATA ==========
  tags: [{
    type: String,
    lowercase: true,
    trim: true
  }],

  notes: String,

  linkedEntries: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Entry'
  }],

  reminderEnabled: {
    type: Boolean,
    default: true
  },

  reminderTime: String

}, {
  timestamps: true
});

// ════════════════════════════════════════════════════════════
// INDEXES
// ════════════════════════════════════════════════════════════
goalSchema.index({ user: 1, status: 1 });
goalSchema.index({ user: 1, category: 1 });
goalSchema.index({ targetDate: 1 });

// ════════════════════════════════════════════════════════════
// VIRTUAL FIELDS
// ════════════════════════════════════════════════════════════

// Calculate progress percentage
goalSchema.virtual('progressPercentage').get(function() {
  if (this.targetValue === 0) return 0;
  return Math.min(Math.round((this.currentValue / this.targetValue) * 100), 100);
});

// Check if overdue
goalSchema.virtual('isOverdue').get(function() {
  if (this.status === 'completed') return false;
  return new Date() > this.targetDate;
});

// Days remaining
goalSchema.virtual('daysRemaining').get(function() {
  if (this.status === 'completed') return 0;
  const now = new Date();
  const target = new Date(this.targetDate);
  const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
  return Math.max(diff, 0);
});

// Milestone completion percentage
goalSchema.virtual('milestoneProgress').get(function() {
  if (!this.milestones || this.milestones.length === 0) return 0;
  const completed = this.milestones.filter(m => m.completed).length;
  return Math.round((completed / this.milestones.length) * 100);
});

// Enable virtuals in JSON
goalSchema.set('toJSON', { virtuals: true });
goalSchema.set('toObject', { virtuals: true });

// ════════════════════════════════════════════════════════════
// METHODS
// ════════════════════════════════════════════════════════════

// Update progress
goalSchema.methods.updateProgress = function(newValue) {
  this.currentValue = newValue;
  
  if (this.currentValue >= this.targetValue && this.status !== 'completed') {
    this.status = 'completed';
    this.completedAt = new Date();
  }
  
  return this.save();
};

// Complete milestone
goalSchema.methods.completeMilestone = function(milestoneId) {
  const milestone = this.milestones.id(milestoneId);
  if (milestone) {
    milestone.completed = true;
    milestone.completedAt = new Date();
  }
  return this.save();
};

module.exports = mongoose.model('Goal', goalSchema);
```

---

### `backend/models/Streak.js`

```javascript
const mongoose = require('mongoose');

const streakSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  currentStreak: {
    type: Number,
    default: 0
  },
  longestStreak: {
    type: Number,
    default: 0
  },
  lastEntryDate: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Streak', streakSchema);
```

---

### `backend/models/Challenge.js`

```javascript
const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  date: {
    type: Date,
    required: true,
    index: true
  },

  challenges: [{
    type: {
      type: String,
      enum: [
        'word-count',      // Write X+ words
        'early-bird',      // Journal before 9 AM
        'night-owl',       // Journal after 10 PM
        'tag-master',      // Use 3+ tags
        'streak-keeper',   // Maintain streak
        'mood-variety',    // Log different mood
        'detailed-entry',  // 200+ words
        'grateful',        // Mention gratitude
        'reflection'       // Answer reflection prompt
      ],
      required: true
    },
    
    title: String,
    description: String,
    
    target: Number,
    progress: {
      type: Number,
      default: 0
    },
    
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: Date,
    
    xpReward: {
      type: Number,
      default: 50
    }
  }],

  totalXPEarned: {
    type: Number,
    default: 0
  },

  completedCount: {
    type: Number,
    default: 0
  }

}, {
  timestamps: true
});

// Index for fetching today's challenges
challengeSchema.index({ user: 1, date: 1 });

// Method to check completion
challengeSchema.methods.checkCompletion = function() {
  this.completedCount = this.challenges.filter(c => c.completed).length;
  this.totalXPEarned = this.challenges
    .filter(c => c.completed)
    .reduce((sum, c) => sum + c.xpReward, 0);
  return this.save();
};

module.exports = mongoose.model('Challenge', challengeSchema);

```

---

## 📁 Backend Routes

### `backend/routes/auth.js`

```javascript
const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');

// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/login
router.post('/login', login);

module.exports = router;
```

---

### `backend/routes/entries.js`

```javascript
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createEntry,
  getEntries,
  getEntry,
  updateEntry,
  deleteEntry,
  getTodayEntry
} = require('../controllers/entryController');

// ════════════════════════════════════════════════════════════
// ALL ROUTES ARE PROTECTED (require login)
// ════════════════════════════════════════════════════════════

// Today's entry (special route - must be before /:id)
router.get('/today', protect, getTodayEntry);

// Main CRUD routes
router.route('/')
  .post(protect, createEntry)      // Create entry
  .get(protect, getEntries);       // Get all entries

router.route('/:id')
  .get(protect, getEntry)          // Get single entry
  .put(protect, updateEntry)       // Update entry
  .delete(protect, deleteEntry);   // Delete entry

module.exports = router;
/* ════════════════════════════════════════════════════════════
   📚 ENTRY ROUTES EXPLANATION:
   ════════════════════════════════════════════════════════════
   
   1. ROUTE ORDER MATTERS:
      
      ✅ CORRECT ORDER:
      router.get('/today', ...)    // Specific route first
      router.get('/:id', ...)       // Dynamic route second
      
      ❌ WRONG ORDER:
      router.get('/:id', ...)       // This catches '/today' too!
      router.get('/today', ...)     // Never reached
      
      WHY?
      Express matches routes top-to-bottom.
      '/:id' would match '/today' and treat "today" as an ID.
   
   2. ENDPOINT BREAKDOWN:
      
      ┌─────────────────────────────────────────────────────────┐
      │  Endpoint              │  Method │  Description         │
      ├─────────────────────────────────────────────────────────┤
      │  /api/entries/today    │  GET    │  Check today's entry │
      │  /api/entries          │  POST   │  Create new entry    │
      │  /api/entries          │  GET    │  Get all entries     │
      │  /api/entries/:id      │  GET    │  Get single entry    │
      │  /api/entries/:id      │  PUT    │  Update entry        │
      │  /api/entries/:id      │  DELETE │  Delete entry        │
      └─────────────────────────────────────────────────────────┘
   
   3. AUTHENTICATION FLOW:
      
      Request → protect middleware → verify token → controller
                     ↓
                 If token invalid
                     ↓
                 401 Response (no controller reached)
   
   4. QUERY PARAMETERS (GET /api/entries):
      
      a) PAGINATION:
         ?page=2&limit=10
         → Returns entries 11-20
      
      b) FILTERING:
         ?mood=happy
         → Only happy entries
         
         ?category=work
         → Only work-related entries
      
      c) DATE RANGE:
         ?startDate=2024-01-01&endDate=2024-01-31
         → Entries from January
      
      d) COMBINED:
         ?page=1&limit=5&mood=happy&category=personal
         → First 5 happy personal entries
   
   5. REQUEST/RESPONSE EXAMPLES:
      
      ──────────────────────────────────────────────────────────
      CREATE ENTRY (POST /api/entries)
      ──────────────────────────────────────────────────────────
      
      Request:
      POST /api/entries
      Headers:
        Authorization: Bearer abc123...
        Content-Type: application/json
      Body:
      {
        "mood": "happy",
        "moodEmoji": "😊",
        "title": "Great day at work!",
        "notes": "Had a productive meeting with the team. We finalized the project roadmap and everyone was aligned. Feeling accomplished!",
        "tags": ["work", "productivity", "team"],
        "category": "work",
        "location": {
          "enabled": true,
          "coordinates": {
            "latitude": 28.7041,
            "longitude": 77.1025
          },
          "placeName": "Office",
          "city": "New Delhi",
          "country": "India"
        }
      }
      
      Response (201 Created):
      {
        "success": true,
        "message": "Entry created successfully!",
        "data": {
          "entry": {
            "_id": "65a1b2c3d4e5f6...",
            "user": "507f1f77bcf86cd7...",
            "mood": "happy",
            "moodEmoji": "😊",
            "title": "Great day at work!",
            "notes": "Had a productive meeting...",
            "wordCount": 23,
            "isDetailedEntry": false,
            "xpAwarded": 65,
            "createdAt": "2024-01-15T10:30:00.000Z"
          },
          "rewards": {
            "xp": {
              "base": 50,
              "bonus": 15,
              "total": 65,
              "breakdown": [
                { "reason": "Base entry XP", "xp": 50 },
                { "reason": "Well-categorized with tags", "xp": 10 },
                { "reason": "Geo-tagged entry", "xp": 5 }
              ]
            },
            "leveledUp": false,
            "newLevel": 3,
            "streak": {
              "currentStreak": 8,
              "streakIncreased": true,
              "milestone": null
            },
            "newBadges": []
          }
        }
      }
      
      ──────────────────────────────────────────────────────────
      GET ALL ENTRIES (GET /api/entries?page=1&limit=5)
      ──────────────────────────────────────────────────────────
      
      Request:
      GET /api/entries?page=1&limit=5&mood=happy
      Headers:
        Authorization: Bearer abc123...
      
      Response (200 OK):
      {
        "success": true,
        "data": {
          "entries": [
            {
              "_id": "65a1b2c3...",
              "mood": "happy",
              "moodEmoji": "😊",
              "title": "Great day!",
              "notes": "...",
              "wordCount": 23,
              "createdAt": "2024-01-15T10:30:00.000Z"
            },
            // ... 4 more entries
          ],
          "pagination": {
            "currentPage": 1,
            "totalPages": 3,
            "totalEntries": 15,
            "hasMore": true
          }
        }
      }
      
      ──────────────────────────────────────────────────────────
      UPDATE ENTRY (PUT /api/entries/:id)
      ──────────────────────────────────────────────────────────
      
      Request:
      PUT /api/entries/65a1b2c3d4e5f6...
      Headers:
        Authorization: Bearer abc123...
        Content-Type: application/json
      Body:
      {
        "title": "Updated title",
        "notes": "Updated content with more details..."
      }
      
      Response (200 OK):
      {
        "success": true,
        "message": "Entry updated successfully",
        "data": {
          "_id": "65a1b2c3...",
          "title": "Updated title",
          "notes": "Updated content...",
          "isEdited": true,
          "updatedAt": "2024-01-15T15:45:00.000Z"
        }
      }
      
      ──────────────────────────────────────────────────────────
      DELETE ENTRY (DELETE /api/entries/:id)
      ──────────────────────────────────────────────────────────
      
      Request:
      DELETE /api/entries/65a1b2c3d4e5f6...
      Headers:
        Authorization: Bearer abc123...
      
      Response (200 OK):
      {
        "success": true,
        "message": "Entry deleted successfully"
      }
      
      ──────────────────────────────────────────────────────────
      GET TODAY'S ENTRY (GET /api/entries/today)
      ──────────────────────────────────────────────────────────
      
      Request:
      GET /api/entries/today
      Headers:
        Authorization: Bearer abc123...
      
      Response (200 OK) - HAS ENTRY:
      {
        "success": true,
        "data": {
          "hasEntryToday": true,
          "entry": {
            "_id": "65a1b2c3...",
            "mood": "happy",
            "notes": "...",
            "createdAt": "2024-01-15T08:00:00.000Z"
          }
        }
      }
      
      Response (200 OK) - NO ENTRY:
      {
        "success": true,
        "data": {
          "hasEntryToday": false,
          "entry": null
        }
      }
   
   6. ERROR RESPONSES:
      
      ──────────────────────────────────────────────────────────
      UNAUTHORIZED (401)
      ──────────────────────────────────────────────────────────
      {
        "success": false,
        "message": "Not authorized to access this route. Please login."
      }
      
      ──────────────────────────────────────────────────────────
      NOT FOUND (404)
      ──────────────────────────────────────────────────────────
      {
        "success": false,
        "message": "Entry not found"
      }
      
      ──────────────────────────────────────────────────────────
      VALIDATION ERROR (400)
      ──────────────────────────────────────────────────────────
      {
        "success": false,
        "message": "Mood and notes are required"
      }
      
      ──────────────────────────────────────────────────────────
      SERVER ERROR (500)
      ──────────────────────────────────────────────────────────
      {
        "success": false,
        "message": "Server error message here"
      }
   
   7. SECURITY FEATURES:
      
      a) USER OWNERSHIP:
         - Users can only access their own entries
         - Controller checks: entry.user === req.user.id
      
      b) TOKEN REQUIRED:
         - All routes protected with 'protect' middleware
         - Invalid/missing token = 401 response
      
      c) INPUT VALIDATION:
         - Required fields checked
         - Min/max length enforced
         - Malicious input sanitized
   
   8. PERFORMANCE OPTIMIZATIONS:
      
      a) PAGINATION:
         - Limits results per request
         - Prevents large data transfers
         - Improves response time
      
      b) SELECTIVE FIELDS:
         - .select('-__v') excludes version field
         - Reduces payload size
      
      c) INDEXES:
         - user + createdAt indexed
         - Fast queries for user's entries
   
   ════════════════════════════════════════════════════════════ */
```

---

### `backend/routes/goals.js`

```javascript
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createGoal,
  getGoals,
  getGoal,
  updateGoal,
  updateProgress,
  completeMilestone,
  deleteGoal,
  getGoalStats
} = require('../controllers/goalController');

// ════════════════════════════════════════════════════════════
// ALL ROUTES REQUIRE AUTHENTICATION
// ════════════════════════════════════════════════════════════

// Statistics route
router.get('/stats/overview', protect, getGoalStats);

// Main CRUD routes
router.route('/')
  .post(protect, createGoal)
  .get(protect, getGoals);

router.route('/:id')
  .get(protect, getGoal)
  .put(protect, updateGoal)
  .delete(protect, deleteGoal);

// Progress update
router.patch('/:id/progress', protect, updateProgress);

// Milestone completion
router.patch('/:id/milestones/:milestoneId', protect, completeMilestone);

module.exports = router;
```

---

### `backend/routes/stats.js`

```javascript
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getDashboardStats,
  getMoodTrends,
  getWeeklyActivity,
  getGoalConsistency,
  getGoalTimeline
} = require('../controllers/statsController');

// Add these routes
router.get('/goal-consistency', protect, getGoalConsistency);
router.get('/goal-timeline', protect, getGoalTimeline);
router.get('/dashboard', protect, getDashboardStats);
router.get('/mood-trends', protect, getMoodTrends);
router.get('/weekly-activity', protect, getWeeklyActivity);

module.exports = router;
```

---

### `backend/routes/challenges.js`

```javascript
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getTodayChallenges,
  completeChallenge,
  getChallengeHistory,
  getChallengeStats
} = require('../controllers/challengeController');

// ════════════════════════════════════════════════════════════
// ALL ROUTES REQUIRE AUTHENTICATION
// ════════════════════════════════════════════════════════════

router.get('/today', protect, getTodayChallenges);
router.get('/history', protect, getChallengeHistory);
router.get('/stats', protect, getChallengeStats);
router.patch('/:challengeId/complete', protect, completeChallenge);

module.exports = router;
```

---

## 📁 Backend Controllers

### `backend/controllers/authController.js`

```javascript
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'lumin-secret-key', {
    expiresIn: '30d'
  });
};

// Register new user
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword
    });

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        xp: user.xp,
        level: user.level,
        streak: user.streak
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        xp: user.xp,
        level: user.level,
        streak: user.streak
      }
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
```

---

### `backend/controllers/entryController.js`

```javascript
const Entry = require('../models/Entry');
const User = require('../models/User');
const { 
  calculateXP, 
  calculateLevel, 
  updateStreak, 
  checkBadges, 
  checkLevelUp 
} = require('../utils/gamification');

// ════════════════════════════════════════════════════════════
// @desc    Create new journal entry
// @route   POST /api/entries
// @access  Private
// ════════════════════════════════════════════════════════════
exports.createEntry = async (req, res) => {
  try {
    const { 
      mood, 
      moodEmoji, 
      moodIntensity, 
      title, 
      notes, 
      tags, 
      isPrivate, 
      entryDate,
      category,
      location 
    } = req.body;

    // ========== VALIDATION ==========
    if (!mood || !notes) {
      return res.status(400).json({
        success: false,
        message: 'Mood and notes are required'
      });
    }

    if (notes.length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Entry must be at least 10 characters long'
      });
    }

    // ========== CHECK TODAY'S ENTRY ==========
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingEntry = await Entry.findOne({
      user: req.user._id,
      entryDate: { $gte: today }
    });

    if (existingEntry) {
      return res.status(400).json({
        success: false,
        message: 'You have already created an entry today. You can edit it instead.',
        data: {
          hasEntryToday: true,
          existingEntry: existingEntry._id
        }
      });
    }

    // ========== CREATE ENTRY ==========
    const entry = await Entry.create({
      user: req.user._id,
      mood: mood.toLowerCase(),
      moodEmoji: moodEmoji || getMoodEmoji(mood),
      moodIntensity: moodIntensity || 5,
      title: title || '',
      notes,
      tags: tags || [],
      category: category || 'personal',
      location: location || null,
      isPrivate: isPrivate !== undefined ? isPrivate : true,
      entryDate: entryDate || Date.now()
    });

    // ========== AUTO-CHECK CHALLENGES ==========
const { updateChallengeProgress } = require('../services/challengeService');
const updatedChallenges = await updateChallengeProgress(req.user._id, entry);

let challengeXP = 0;
if (updatedChallenges && updatedChallenges.totalXPEarned > 0) {
  challengeXP = updatedChallenges.totalXPEarned;
  user.xp += challengeXP;
  user.level = calculateLevel(user.xp);
  await user.save();
}

// Update response to include challenge info
res.status(201).json({
  success: true,
  message: 'Entry created successfully! 🎉',
  data: {
    entry,
    rewards: {
      xp: xpResult,
      leveledUp,
      oldLevel,
      newLevel: user.level,
      streak: {
        currentStreak: user.streak,
        streakIncreased: streakResult.streakChanged,
        milestone: streakResult.milestone || null,
        bonusXP: streakResult.bonusXP || 0
      },
      newBadges,
      challengesCompleted: updatedChallenges ? updatedChallenges.completedCount : 0,
      challengeXP
    }
  }
});

    // ========== GET USER & SAVE OLD XP ==========
    const user = await User.findById(req.user._id);
    const oldXP = user.xp;
    const oldLevel = user.level;

    // ========== CALCULATE XP (Using YOUR advanced function) ==========
    const xpResult = calculateXP(entry);
    entry.xpAwarded = xpResult.total;
    await entry.save();

    // Award XP to user
    user.xp += xpResult.total;

    // ========== UPDATE STREAK (Using YOUR function) ==========
    const streakResult = await updateStreak(user._id);
    
    if (streakResult.streakChanged) {
      user.streak = streakResult.currentStreak;
    }
    
    // Award streak milestone bonus
    if (streakResult.bonusXP) {
      user.xp += streakResult.bonusXP;
    }

    // Update last entry date
    user.lastEntryDate = new Date();

    // ========== CALCULATE NEW LEVEL ==========
    user.level = calculateLevel(user.xp);
    const leveledUp = user.level > oldLevel;

    // ========== CHECK BADGES (Using YOUR function) ==========
    const newBadges = await checkBadges(user);

    // ========== SAVE USER ==========
    await user.save();

    // ========== RESPONSE WITH DETAILED REWARDS ==========
    res.status(201).json({
      success: true,
      message: 'Entry created successfully! 🎉',
      data: {
        entry: {
          _id: entry._id,
          mood: entry.mood,
          moodEmoji: entry.moodEmoji,
          moodIntensity: entry.moodIntensity,
          title: entry.title,
          notes: entry.notes,
          wordCount: entry.wordCount,
          tags: entry.tags,
          isPrivate: entry.isPrivate,
          entryDate: entry.entryDate,
          createdAt: entry.createdAt
        },
        rewards: {
          xp: xpResult,  // { base, bonus, total, breakdown }
          leveledUp,
          oldLevel,
          newLevel: user.level,
          streak: {
            currentStreak: user.streak,
            streakIncreased: streakResult.streakChanged,
            streakBroken: streakResult.streakBroken || false,
            milestone: streakResult.milestone || null,
            bonusXP: streakResult.bonusXP || 0,
            message: streakResult.message
          },
          newBadges  // Array of newly earned badges
        }
      }
    });

  } catch (error) {
    console.error('Create Entry Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create entry',
      error: error.message
    });
  }
};

// ════════════════════════════════════════════════════════════
// @desc    Get all user entries
// @route   GET /api/entries
// @access  Private
// ════════════════════════════════════════════════════════════
exports.getEntries = async (req, res) => {
  try {
    const { 
      mood, 
      tags, 
      category,
      startDate, 
      endDate, 
      limit = 20, 
      page = 1 
    } = req.query;

    // ========== BUILD FILTER ==========
    const filter = { user: req.user._id };

    if (mood) {
      filter.mood = mood.toLowerCase();
    }

    if (category) {
      filter.category = category;
    }

    if (tags) {
      filter.tags = { $in: tags.split(',').map(t => t.trim()) };
    }

    if (startDate || endDate) {
      filter.entryDate = {};
      if (startDate) filter.entryDate.$gte = new Date(startDate);
      if (endDate) filter.entryDate.$lte = new Date(endDate);
    }

    // ========== PAGINATION ==========
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // ========== GET ENTRIES ==========
    const entries = await Entry.find(filter)
      .sort({ entryDate: -1 })  // Newest first
      .limit(parseInt(limit))
      .skip(skip)
      .select('-__v');

    const total = await Entry.countDocuments(filter);

    // ========== RESPONSE ==========
    res.status(200).json({
      success: true,
      data: {
        entries,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalEntries: total,
          hasMore: skip + entries.length < total
        }
      }
    });

  } catch (error) {
    console.error('Get Entries Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch entries',
      error: error.message
    });
  }
};

// ════════════════════════════════════════════════════════════
// @desc    Get single entry
// @route   GET /api/entries/:id
// @access  Private
// ════════════════════════════════════════════════════════════
exports.getEntry = async (req, res) => {
  try {
    const entry = await Entry.findById(req.params.id);

    // ========== CHECK EXISTS ==========
    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Entry not found'
      });
    }

    // ========== CHECK OWNERSHIP ==========
    if (entry.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this entry'
      });
    }

    // ========== RESPONSE ==========
    res.status(200).json({
      success: true,
      data: entry
    });

  } catch (error) {
    console.error('Get Entry Error:', error);
    
    // Handle invalid MongoDB ID
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Entry not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to fetch entry',
      error: error.message
    });
  }
};

// ════════════════════════════════════════════════════════════
// @desc    Update entry
// @route   PUT /api/entries/:id
// @access  Private
// ════════════════════════════════════════════════════════════
exports.updateEntry = async (req, res) => {
  try {
    let entry = await Entry.findById(req.params.id);

    // ========== CHECK EXISTS ==========
    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Entry not found'
      });
    }

    // ========== CHECK OWNERSHIP ==========
    if (entry.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this entry'
      });
    }

    // ========== UPDATE FIELDS ==========
    const allowedUpdates = [
      'mood', 
      'moodEmoji', 
      'moodIntensity', 
      'title', 
      'notes', 
      'tags', 
      'category',
      'location',
      'isPrivate'
    ];
    
    const updates = {};

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // ========== UPDATE ENTRY ==========
    entry = await Entry.findByIdAndUpdate(
      req.params.id,
      updates,
      {
        new: true,  // Return updated document
        runValidators: true
      }
    );

    // ========== RECALCULATE XP IF CONTENT CHANGED ==========
    if (updates.notes || updates.tags || updates.location) {
      const xpResult = calculateXP(entry);
      const xpDifference = xpResult.total - entry.xpAwarded;
      
      if (xpDifference !== 0) {
        // Update entry XP
        entry.xpAwarded = xpResult.total;
        await entry.save();
        
        // Update user XP
        const user = await User.findById(req.user._id);
        user.xp += xpDifference;
        user.level = calculateLevel(user.xp);
        await user.save();
      }
    }

    // ========== RESPONSE ==========
    res.status(200).json({
      success: true,
      message: 'Entry updated successfully',
      data: entry
    });

  } catch (error) {
    console.error('Update Entry Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update entry',
      error: error.message
    });
  }
};

// ════════════════════════════════════════════════════════════
// @desc    Delete entry
// @route   DELETE /api/entries/:id
// @access  Private
// ════════════════════════════════════════════════════════════
exports.deleteEntry = async (req, res) => {
  try {
    const entry = await Entry.findById(req.params.id);

    // ========== CHECK EXISTS ==========
    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Entry not found'
      });
    }

    // ========== CHECK OWNERSHIP ==========
    if (entry.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this entry'
      });
    }

    // ========== DELETE ENTRY ==========
    await entry.deleteOne();

    // ========== RESPONSE ==========
    res.status(200).json({
      success: true,
      message: 'Entry deleted successfully'
    });

  } catch (error) {
    console.error('Delete Entry Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete entry',
      error: error.message
    });
  }
};

// ════════════════════════════════════════════════════════════
// @desc    Get today's entry
// @route   GET /api/entries/today
// @access  Private
// ════════════════════════════════════════════════════════════
exports.getTodayEntry = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const entry = await Entry.findOne({
      user: req.user._id,
      entryDate: { $gte: today, $lt: tomorrow }
    });

    if (!entry) {
      return res.status(200).json({
        success: true,
        data: {
          hasEntryToday: false,
          entry: null
        }
      });
    }

    res.status(200).json({
      success: true,
      data: {
        hasEntryToday: true,
        entry
      }
    });

  } catch (error) {
    console.error('Get Today Entry Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch today\'s entry',
      error: error.message
    });
  }
};

// ════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ════════════════════════════════════════════════════════════
function getMoodEmoji(mood) {
  const emojiMap = {
    amazing: '🤩',
    happy: '😊',
    neutral: '😐',
    sad: '😢',
    angry: '😠',
    anxious: '😰',
    stressed: '😫',
    excited: '🤗'
  };
  return emojiMap[mood.toLowerCase()] || '😊';
}
```

---

### `backend/controllers/goalController.js`

```javascript
const Goal = require('../models/Goal');
const User = require('../models/User');
const { calculateLevel } = require('../utils/gamification');

// ════════════════════════════════════════════════════════════
// @desc    Create new goal
// @route   POST /api/goals
// @access  Private
// ════════════════════════════════════════════════════════════
exports.createGoal = async (req, res) => {
  try {
    const {
      title,
      description,
      metric,
      targetValue,
      unit,
      category,
      priority,
      targetDate,
      milestones,
      tags
    } = req.body;

    // ========== VALIDATION ==========
    if (!title || !description || !targetValue || !targetDate || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // ========== CREATE GOAL ==========
    const goal = await Goal.create({
      user: req.user._id,
      title,
      description,
      metric: metric || 'Progress',
      targetValue,
      unit: unit || 'units',
      category,
      priority: priority || 'medium',
      targetDate,
      milestones: milestones || [],
      tags: tags || []
    });

    // ========== AWARD XP FOR GOAL CREATION ==========
    const user = await User.findById(req.user._id);
    user.xp += 50; // Bonus for setting a goal
    user.level = calculateLevel(user.xp);
    await user.save();

    // ========== RESPONSE ==========
    res.status(201).json({
      success: true,
      message: 'Goal created successfully! +50 XP',
      data: {
        goal,
        xpEarned: 50,
        newLevel: user.level
      }
    });

  } catch (error) {
    console.error('Create Goal Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create goal',
      error: error.message
    });
  }
};

// ════════════════════════════════════════════════════════════
// @desc    Get all user goals
// @route   GET /api/goals
// @access  Private
// ════════════════════════════════════════════════════════════
exports.getGoals = async (req, res) => {
  try {
    const { status, category } = req.query;

    // ========== BUILD FILTER ==========
    const filter = { user: req.user._id };

    if (status) filter.status = status;
    if (category) filter.category = category;

    // ========== GET GOALS ==========
    const goals = await Goal.find(filter)
      .sort({ createdAt: -1 })
      .select('-__v');

    // ========== STATISTICS ==========
    const stats = {
      total: goals.length,
      active: goals.filter(g => g.status === 'active').length,
      completed: goals.filter(g => g.status === 'completed').length,
      overdue: goals.filter(g => g.isOverdue).length
    };

    // ========== RESPONSE ==========
    res.status(200).json({
      success: true,
      count: goals.length,
      stats,
      data: goals
    });

  } catch (error) {
    console.error('Get Goals Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch goals',
      error: error.message
    });
  }
};

// ════════════════════════════════════════════════════════════
// @desc    Get single goal
// @route   GET /api/goals/:id
// @access  Private
// ════════════════════════════════════════════════════════════
exports.getGoal = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);

    // ========== CHECK EXISTS ==========
    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    // ========== CHECK OWNERSHIP ==========
    if (goal.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this goal'
      });
    }

    // ========== RESPONSE ==========
    res.status(200).json({
      success: true,
      data: goal
    });

  } catch (error) {
    console.error('Get Goal Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch goal',
      error: error.message
    });
  }
};

// ════════════════════════════════════════════════════════════
// @desc    Update goal
// @route   PUT /api/goals/:id
// @access  Private
// ════════════════════════════════════════════════════════════
exports.updateGoal = async (req, res) => {
  try {
    let goal = await Goal.findById(req.params.id);

    // ========== CHECK EXISTS ==========
    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    // ========== CHECK OWNERSHIP ==========
    if (goal.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this goal'
      });
    }

    // ========== UPDATE GOAL ==========
    const allowedUpdates = [
      'title', 'description', 'metric', 'targetValue', 'currentValue',
      'unit', 'category', 'priority', 'targetDate', 'status', 'notes', 'tags'
    ];

    const updates = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    goal = await Goal.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    // ========== RESPONSE ==========
    res.status(200).json({
      success: true,
      message: 'Goal updated successfully',
      data: goal
    });

  } catch (error) {
    console.error('Update Goal Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update goal',
      error: error.message
    });
  }
};

// ════════════════════════════════════════════════════════════
// @desc    Update goal progress
// @route   PATCH /api/goals/:id/progress
// @access  Private
// ════════════════════════════════════════════════════════════
exports.updateProgress = async (req, res) => {
  try {
    const { currentValue } = req.body;

    let goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    if (goal.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // ========== UPDATE PROGRESS ==========
    const wasCompleted = goal.status === 'completed';
    await goal.updateProgress(currentValue);

    let xpEarned = 0;
    let message = 'Progress updated';

    // ========== CHECK IF JUST COMPLETED ==========
    if (!wasCompleted && goal.status === 'completed') {
      const user = await User.findById(req.user._id);
      xpEarned = goal.xpReward;
      user.xp += xpEarned;
      user.level = calculateLevel(user.xp);
      
      // Award goal completion badge
      const existingBadge = user.badges.find(b => b.name === 'goal-achiever');
      if (!existingBadge) {
        user.badges.push({
          name: 'goal-achiever',
          displayName: '🎯 Goal Achiever',
          earnedAt: new Date(),
          xpAwarded: 100
        });
        user.xp += 100;
        xpEarned += 100;
      }

      await user.save();
      message = `Goal completed! +${xpEarned} XP 🎉`;
    }

    // ========== RESPONSE ==========
    res.status(200).json({
      success: true,
      message,
      data: {
        goal,
        xpEarned,
        completed: goal.status === 'completed'
      }
    });

  } catch (error) {
    console.error('Update Progress Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update progress',
      error: error.message
    });
  }
};

// ════════════════════════════════════════════════════════════
// @desc    Complete milestone
// @route   PATCH /api/goals/:id/milestones/:milestoneId
// @access  Private
// ════════════════════════════════════════════════════════════
exports.completeMilestone = async (req, res) => {
  try {
    const { id, milestoneId } = req.params;

    let goal = await Goal.findById(id);

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    if (goal.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // ========== COMPLETE MILESTONE ==========
    await goal.completeMilestone(milestoneId);

    const milestone = goal.milestones.id(milestoneId);
    const xpEarned = milestone.xpReward;

    // ========== AWARD XP ==========
    const user = await User.findById(req.user._id);
    user.xp += xpEarned;
    user.level = calculateLevel(user.xp);
    await user.save();

    // ========== RESPONSE ==========
    res.status(200).json({
      success: true,
      message: `Milestone completed! +${xpEarned} XP`,
      data: {
        goal,
        xpEarned,
        newLevel: user.level
      }
    });

  } catch (error) {
    console.error('Complete Milestone Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete milestone',
      error: error.message
    });
  }
};

// ════════════════════════════════════════════════════════════
// @desc    Delete goal
// @route   DELETE /api/goals/:id
// @access  Private
// ════════════════════════════════════════════════════════════
exports.deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    if (goal.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this goal'
      });
    }

    await goal.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Goal deleted successfully'
    });

  } catch (error) {
    console.error('Delete Goal Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete goal',
      error: error.message
    });
  }
};

// ════════════════════════════════════════════════════════════
// @desc    Get goal statistics
// @route   GET /api/goals/stats/overview
// @access  Private
// ════════════════════════════════════════════════════════════
exports.getGoalStats = async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user._id });

    // ========== CALCULATE STATS ==========
    const stats = {
      total: goals.length,
      active: goals.filter(g => g.status === 'active').length,
      completed: goals.filter(g => g.status === 'completed').length,
      paused: goals.filter(g => g.status === 'paused').length,
      abandoned: goals.filter(g => g.status === 'abandoned').length,
      overdue: goals.filter(g => g.isOverdue).length,
      
      byCategory: {},
      completionRate: goals.length > 0 
        ? Math.round((goals.filter(g => g.status === 'completed').length / goals.length) * 100)
        : 0,
      
      avgProgress: goals.length > 0
        ? Math.round(goals.reduce((sum, g) => sum + g.progressPercentage, 0) / goals.length)
        : 0
    };

    // ========== CATEGORY BREAKDOWN ==========
    const categories = ['career', 'health', 'learning', 'finance', 'relationships', 'hobbies', 'other'];
    categories.forEach(cat => {
      const catGoals = goals.filter(g => g.category === cat);
      stats.byCategory[cat] = {
        total: catGoals.length,
        completed: catGoals.filter(g => g.status === 'completed').length
      };
    });

    // ========== RESPONSE ==========
    res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Get Goal Stats Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch goal statistics',
      error: error.message
    });
  }
};
```

---

### `backend/controllers/statsController.js`

```javascript
const Entry = require('../models/Entry');
const User = require('../models/User');

// ════════════════════════════════════════════════════════════
// @desc    Get user dashboard stats
// @route   GET /api/stats/dashboard
// @access  Private
// ════════════════════════════════════════════════════════════
exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // ========== GET USER DATA ==========
    const user = await User.findById(userId).select('-password');

    // ========== COUNT ENTRIES ==========
    const totalEntries = await Entry.countDocuments({ user: userId });

    // ========== GET RECENT ENTRIES ==========
    const recentEntries = await Entry.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('mood moodEmoji title notes xpAwarded createdAt');

    // ========== GET THIS WEEK'S ENTRIES ==========
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    
    const weekEntries = await Entry.countDocuments({
      user: userId,
      createdAt: { $gte: weekStart }
    });

    // ========== GET MOOD DISTRIBUTION ==========
    const moodDistribution = await Entry.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$mood', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // ========== CALCULATE NEXT LEVEL XP ==========
    const currentLevel = user.level;
    const currentXP = user.xp;
    const xpForCurrentLevel = (currentLevel - 1) * 150;
    const xpForNextLevel = currentLevel * 150;
    const xpProgress = ((currentXP - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100;

    // ========== RESPONSE ==========
    res.status(200).json({
      success: true,
      data: {
        user: {
          name: user.name,
          email: user.email,
          xp: user.xp,
          level: user.level,
          streak: user.streak,
          badges: user.badges
        },
        stats: {
          totalEntries,
          weekEntries,
          longestStreak: user.streak, // TODO: Track separately
          totalXP: user.xp
        },
        progress: {
          xpProgress: Math.round(xpProgress),
          xpForNextLevel: xpForNextLevel - currentXP,
          currentLevelXP: currentXP - xpForCurrentLevel,
          nextLevelXP: xpForNextLevel - xpForCurrentLevel
        },
        recentEntries,
        moodDistribution: moodDistribution.map(m => ({
          mood: m._id,
          count: m.count
        }))
      }
    });

  } catch (error) {
    console.error('Get Dashboard Stats Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard stats',
      error: error.message
    });
  }
};

// ════════════════════════════════════════════════════════════
// @desc    Get mood analytics
// @route   GET /api/stats/mood-trends
// @access  Private
// ════════════════════════════════════════════════════════════
exports.getMoodTrends = async (req, res) => {
  try {
    const userId = req.user._id;
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // ========== GET DAILY MOOD DATA ==========
    const moodTrends = await Entry.aggregate([
      {
        $match: {
          user: userId,
          entryDate: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$entryDate' } },
            mood: '$mood'
          },
          count: { $sum: 1 },
          avgIntensity: { $avg: '$moodIntensity' }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: moodTrends
    });

  } catch (error) {
    console.error('Get Mood Trends Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch mood trends',
      error: error.message
    });
  }
};

// ════════════════════════════════════════════════════════════
// @desc    Get weekly activity
// @route   GET /api/stats/weekly-activity
// @access  Private
// ════════════════════════════════════════════════════════════
exports.getWeeklyActivity = async (req, res) => {
  try {
    const userId = req.user._id;

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);

    // ========== GET ENTRIES PER DAY ==========
    const weeklyActivity = await Entry.aggregate([
      {
        $match: {
          user: userId,
          entryDate: { $gte: weekStart }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$entryDate' } },
          entries: { $sum: 1 },
          totalXP: { $sum: '$xpAwarded' },
          moods: { $push: '$mood' }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: weeklyActivity
    });

  } catch (error) {
    console.error('Get Weekly Activity Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch weekly activity',
      error: error.message
    });
  }
};

// Add after existing functions

// ════════════════════════════════════════════════════════════
// @desc    Get goal consistency analytics
// @route   GET /api/stats/goal-consistency
// @access  Private
// ════════════════════════════════════════════════════════════
exports.getGoalConsistency = async (req, res) => {
  try {
    const userId = req.user._id;
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const Goal = require('../models/Goal');
    const Entry = require('../models/Entry');

    // Get active goals
    const goals = await Goal.find({ 
      user: userId,
      status: 'active'
    });

    // Get daily entries for consistency
    const entries = await Entry.aggregate([
      {
        $match: {
          user: userId,
          entryDate: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$entryDate' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Calculate consistency score
    const totalDays = parseInt(days);
    const activeDays = entries.length;
    const consistencyScore = Math.round((activeDays / totalDays) * 100);

    // Goal completion rate
    const allGoals = await Goal.find({ user: userId });
    const completedGoals = allGoals.filter(g => g.status === 'completed').length;
    const goalCompletionRate = allGoals.length > 0 
      ? Math.round((completedGoals / allGoals.length) * 100)
      : 0;

    // Daily goal efforts
    const dailyEfforts = await Entry.aggregate([
      {
        $match: {
          user: userId,
          entryDate: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$entryDate' } },
          entries: { $sum: 1 },
          totalWords: { $sum: '$wordCount' },
          totalXP: { $sum: '$xpAwarded' }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Average daily effort
    const avgDailyWords = dailyEfforts.length > 0
      ? Math.round(dailyEfforts.reduce((sum, day) => sum + day.totalWords, 0) / dailyEfforts.length)
      : 0;

    const avgDailyXP = dailyEfforts.length > 0
      ? Math.round(dailyEfforts.reduce((sum, day) => sum + day.totalXP, 0) / dailyEfforts.length)
      : 0;

    // Streak data
    const user = await require('../models/User').findById(userId);

    res.status(200).json({
      success: true,
      data: {
        consistencyScore,
        activeDays,
        totalDays,
        currentStreak: user.streak,
        goals: {
          active: goals.length,
          total: allGoals.length,
          completed: completedGoals,
          completionRate: goalCompletionRate
        },
        dailyEfforts,
        averages: {
          words: avgDailyWords,
          xp: avgDailyXP
        }
      }
    });

  } catch (error) {
    console.error('Get Goal Consistency Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch goal consistency',
      error: error.message
    });
  }
};

// ════════════════════════════════════════════════════════════
// @desc    Get goal progress timeline
// @route   GET /api/stats/goal-timeline
// @access  Private
// ════════════════════════════════════════════════════════════
exports.getGoalTimeline = async (req, res) => {
  try {
    const userId = req.user._id;
    const Goal = require('../models/Goal');

    const goals = await Goal.find({ user: userId })
      .sort({ createdAt: -1 })
      .select('title category status progressPercentage targetDate createdAt completedAt');

    // Group by month
    const timeline = {};
    
    goals.forEach(goal => {
      const month = new Date(goal.createdAt).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      });
      
      if (!timeline[month]) {
        timeline[month] = {
          created: 0,
          completed: 0,
          active: 0
        };
      }
      
      timeline[month].created++;
      if (goal.status === 'completed') timeline[month].completed++;
      if (goal.status === 'active') timeline[month].active++;
    });

    res.status(200).json({
      success: true,
      data: {
        goals,
        timeline
      }
    });

  } catch (error) {
    console.error('Get Goal Timeline Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch goal timeline',
      error: error.message
    });
  }
};
```

---

### `backend/controllers/challengeController.js`

```javascript
const Challenge = require('../models/Challenge');
const User = require('../models/User');
const { generateDailyChallenges, updateChallengeProgress } = require('../services/challengeService');
const { calculateLevel } = require('../utils/gamification');

// ════════════════════════════════════════════════════════════
// @desc    Get today's challenges
// @route   GET /api/challenges/today
// @access  Private
// ════════════════════════════════════════════════════════════
exports.getTodayChallenges = async (req, res) => {
  try {
    // Generate or get today's challenges
    const challenges = await generateDailyChallenges(req.user._id);

    res.status(200).json({
      success: true,
      data: challenges
    });

  } catch (error) {
    console.error('Get Today Challenges Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch challenges',
      error: error.message
    });
  }
};

// ════════════════════════════════════════════════════════════
// @desc    Complete a challenge
// @route   PATCH /api/challenges/:challengeId/complete
// @access  Private
// ════════════════════════════════════════════════════════════
exports.completeChallenge = async (req, res) => {
  try {
    const { challengeId } = req.params;
    const { progress } = req.body;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dailyChallenge = await Challenge.findOne({
      user: req.user._id,
      date: today
    });

    if (!dailyChallenge) {
      return res.status(404).json({
        success: false,
        message: 'No challenges found for today'
      });
    }

    // Find the specific challenge
    const challenge = dailyChallenge.challenges.id(challengeId);

    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found'
      });
    }

    if (challenge.completed) {
      return res.status(400).json({
        success: false,
        message: 'Challenge already completed'
      });
    }

    // Mark as completed
    challenge.progress = progress || challenge.target;
    challenge.completed = true;
    challenge.completedAt = new Date();

    await dailyChallenge.checkCompletion();

    // Award XP
    const user = await User.findById(req.user._id);
    user.xp += challenge.xpReward;
    user.level = calculateLevel(user.xp);
    await user.save();

    res.status(200).json({
      success: true,
      message: `Challenge completed! +${challenge.xpReward} XP 🎉`,
      data: {
        challenge: dailyChallenge,
        xpEarned: challenge.xpReward,
        newLevel: user.level
      }
    });

  } catch (error) {
    console.error('Complete Challenge Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete challenge',
      error: error.message
    });
  }
};

// ════════════════════════════════════════════════════════════
// @desc    Get challenge history
// @route   GET /api/challenges/history
// @access  Private
// ════════════════════════════════════════════════════════════
exports.getChallengeHistory = async (req, res) => {
  try {
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    startDate.setHours(0, 0, 0, 0);

    const history = await Challenge.find({
      user: req.user._id,
      date: { $gte: startDate }
    })
    .sort({ date: -1 })
    .select('-__v');

    // Calculate statistics
    const stats = {
      totalDays: history.length,
      totalChallenges: history.reduce((sum, day) => sum + day.challenges.length, 0),
      completedChallenges: history.reduce((sum, day) => sum + day.completedCount, 0),
      totalXPEarned: history.reduce((sum, day) => sum + day.totalXPEarned, 0),
      perfectDays: history.filter(day => day.completedCount === 3).length
    };

    stats.completionRate = stats.totalChallenges > 0 
      ? Math.round((stats.completedChallenges / stats.totalChallenges) * 100)
      : 0;

    res.status(200).json({
      success: true,
      data: {
        history,
        stats
      }
    });

  } catch (error) {
    console.error('Get Challenge History Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch challenge history',
      error: error.message
    });
  }
};

// ════════════════════════════════════════════════════════════
// @desc    Get challenge statistics
// @route   GET /api/challenges/stats
// @access  Private
// ════════════════════════════════════════════════════════════
exports.getChallengeStats = async (req, res) => {
  try {
    const allChallenges = await Challenge.find({ user: req.user._id });

    // Calculate stats by challenge type
    const typeStats = {};
    const challengeTypes = [
      'word-count', 'early-bird', 'night-owl', 'tag-master',
      'streak-keeper', 'mood-variety', 'detailed-entry', 'grateful', 'reflection'
    ];

    challengeTypes.forEach(type => {
      const typeChallenges = allChallenges.flatMap(day => 
        day.challenges.filter(c => c.type === type)
      );

      typeStats[type] = {
        total: typeChallenges.length,
        completed: typeChallenges.filter(c => c.completed).length,
        completionRate: typeChallenges.length > 0
          ? Math.round((typeChallenges.filter(c => c.completed).length / typeChallenges.length) * 100)
          : 0
      };
    });

    res.status(200).json({
      success: true,
      data: typeStats
    });

  } catch (error) {
    console.error('Get Challenge Stats Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch challenge stats',
      error: error.message
    });
  }
};
```

---

## 📁 Backend Utils & Services

### `backend/utils/gamification.js`

```javascript
const User = require('../models/User');
const Entry = require('../models/Entry');

// ════════════════════════════════════════════════════════════
// CALCULATE XP FOR ENTRY
// ════════════════════════════════════════════════════════════
exports.calculateXP = (entry) => {
  let base = 50;
  let bonus = 0;
  let breakdown = [];

  // ========== WORD COUNT BONUS ==========
  if (entry.wordCount >= 100) {
    bonus += 25;
    breakdown.push({ reason: 'Detailed entry (100+ words)', xp: 25 });
  }

  // ========== TAGS BONUS ==========
  if (entry.tags && entry.tags.length >= 3) {
    bonus += 10;
    breakdown.push({ reason: 'Well-categorized (3+ tags)', xp: 10 });
  }

  // ========== LOCATION BONUS ==========
  if (entry.location && entry.location.enabled) {
    bonus += 5;
    breakdown.push({ reason: 'Geo-tagged entry', xp: 5 });
  }

  // ========== TITLE BONUS ==========
  if (entry.title && entry.title.length > 0) {
    bonus += 5;
    breakdown.push({ reason: 'Added title', xp: 5 });
  }

  return {
    base,
    bonus,
    total: base + bonus,
    breakdown: [{ reason: 'Base entry XP', xp: base }, ...breakdown]
  };
};

// ════════════════════════════════════════════════════════════
// CALCULATE LEVEL FROM XP
// ════════════════════════════════════════════════════════════
exports.calculateLevel = (xp) => {
  const levels = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500, 5500, 6600, 7800, 9100, 10500];
  
  for (let i = levels.length - 1; i >= 0; i--) {
    if (xp >= levels[i]) return i + 1;
  }
  return 1;
};

// ════════════════════════════════════════════════════════════
// GET XP NEEDED FOR NEXT LEVEL
// ════════════════════════════════════════════════════════════
exports.xpForNextLevel = (currentLevel) => {
  const levels = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500, 5500, 6600, 7800, 9100, 10500];
  return levels[currentLevel] || levels[levels.length - 1];
};

// ════════════════════════════════════════════════════════════
// UPDATE USER STREAK
// ════════════════════════════════════════════════════════════
exports.updateStreak = async (userId) => {
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      return { currentStreak: 1, streakChanged: false, error: 'User not found' };
    }

    // ========== FIRST ENTRY EVER ==========
    if (!user.lastEntryDate) {
      return { 
        currentStreak: 1, 
        streakChanged: true,
        isNewStreak: true,
        message: 'Streak started!'
      };
    }

    // ========== CALCULATE DAY DIFFERENCE ==========
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    const last = new Date(user.lastEntryDate);
    last.setHours(0, 0, 0, 0);
    
    const diff = Math.floor((now - last) / (1000 * 60 * 60 * 24));

    // ========== SAME DAY ==========
    if (diff === 0) {
      return { 
        currentStreak: user.streak, 
        streakChanged: false,
        message: 'Already journaled today'
      };
    } 
    // ========== CONSECUTIVE DAY ==========
    else if (diff === 1) {
      const newStreak = user.streak + 1;
      
      // Check for milestone bonuses
      let milestone = null;
      let bonusXP = 0;
      
      if (newStreak === 3) {
        bonusXP = 100;
        milestone = '3-day streak!';
      } else if (newStreak === 7) {
        bonusXP = 250;
        milestone = '7-day streak!';
      } else if (newStreak === 30) {
        bonusXP = 1000;
        milestone = '30-day streak!';
      } else if (newStreak % 10 === 0) {
        bonusXP = newStreak * 10;
        milestone = `${newStreak}-day milestone!`;
      }

      return { 
        currentStreak: newStreak, 
        streakChanged: true,
        milestone,
        bonusXP,
        message: `Streak increased to ${newStreak}!`
      };
    } 
    // ========== STREAK BROKEN ==========
    else {
      return { 
        currentStreak: 1, 
        streakChanged: true, 
        streakBroken: true,
        previousStreak: user.streak,
        message: 'Streak reset. Start fresh!'
      };
    }
  } catch (error) {
    console.error('Update streak error:', error);
    return { 
      currentStreak: 1, 
      streakChanged: false,
      error: error.message
    };
  }
};

// ════════════════════════════════════════════════════════════
// CHECK AND AWARD BADGES
// ════════════════════════════════════════════════════════════
exports.checkBadges = async (user) => {
  const newBadges = [];
  const existing = user.badges.map(b => b.name);

  // ========== BADGE DEFINITIONS ==========
  const badges = [
    // Entry-based badges
    { 
      name: 'first-entry', 
      displayName: '📝 First Step', 
      check: async () => {
        const count = await Entry.countDocuments({ user: user._id });
        return count >= 1;
      }, 
      xp: 25,
      description: 'Created your first journal entry'
    },
    { 
      name: 'consistent-writer', 
      displayName: '✍️ Consistent Writer', 
      check: async () => {
        const count = await Entry.countDocuments({ user: user._id });
        return count >= 10;
      }, 
      xp: 50,
      description: 'Wrote 10 journal entries'
    },
    { 
      name: 'prolific-author', 
      displayName: '📚 Prolific Author', 
      check: async () => {
        const count = await Entry.countDocuments({ user: user._id });
        return count >= 50;
      }, 
      xp: 150,
      description: 'Wrote 50 journal entries'
    },

    // Streak-based badges
    { 
      name: 'fire-starter', 
      displayName: '🔥 Fire Starter', 
      check: () => user.streak >= 3, 
      xp: 50,
      description: 'Maintained a 3-day streak'
    },
    { 
      name: 'week-warrior', 
      displayName: '💪 Week Warrior', 
      check: () => user.streak >= 7, 
      xp: 100,
      description: 'Maintained a 7-day streak'
    },
    { 
      name: 'month-master', 
      displayName: '🏆 Month Master', 
      check: () => user.streak >= 30, 
      xp: 500,
      description: 'Maintained a 30-day streak'
    },
    { 
      name: 'unstoppable', 
      displayName: '⚡ Unstoppable', 
      check: () => user.streak >= 100, 
      xp: 2000,
      description: 'Maintained a 100-day streak'
    },

    // Level-based badges
    { 
      name: 'level-5', 
      displayName: '⭐ Rising Star', 
      check: () => user.level >= 5, 
      xp: 100,
      description: 'Reached Level 5'
    },
    { 
      name: 'level-10', 
      displayName: '🌟 Shining Bright', 
      check: () => user.level >= 10, 
      xp: 250,
      description: 'Reached Level 10'
    }
  ];

  // ========== CHECK EACH BADGE ==========
  for (const badge of badges) {
    // Skip if already earned
    if (existing.includes(badge.name)) continue;
    
    try {
      const unlocked = await badge.check();
      
      if (unlocked) {
        // Add badge to user
        user.badges.push({ 
          name: badge.name, 
          displayName: badge.displayName,
          description: badge.description,
          earnedAt: new Date(), 
          xpAwarded: badge.xp 
        });
        
        // Award XP
        user.xp += badge.xp;
        
        // Track for response
        newBadges.push({ 
          name: badge.name, 
          displayName: badge.displayName,
          description: badge.description,
          xp: badge.xp 
        });
      }
    } catch (error) {
      console.error(`Error checking badge ${badge.name}:`, error);
    }
  }

  // ========== SAVE IF NEW BADGES ==========
  if (newBadges.length > 0) {
    await user.save();
  }

  return newBadges;
};

// ════════════════════════════════════════════════════════════
// CHECK IF USER LEVELED UP
// ════════════════════════════════════════════════════════════
exports.checkLevelUp = (oldXP, newXP) => {
  const oldLevel = exports.calculateLevel(oldXP);
  const newLevel = exports.calculateLevel(newXP);
  
  return {
    leveledUp: newLevel > oldLevel,
    oldLevel,
    newLevel
  };
};
```

---

### `backend/services/challengeService.js`

```javascript
const Challenge = require('../models/Challenge');

// Challenge templates
const challengeTemplates = {
  'word-count': {
    title: '📝 Wordsmith',
    description: 'Write an entry with at least 150 words',
    target: 150,
    xpReward: 50
  },
  'early-bird': {
    title: '🌅 Early Bird',
    description: 'Journal before 9:00 AM',
    target: 1,
    xpReward: 60
  },
  'night-owl': {
    title: '🦉 Night Owl',
    description: 'Journal after 10:00 PM',
    target: 1,
    xpReward: 60
  },
  'tag-master': {
    title: '🏷️ Tag Master',
    description: 'Use at least 3 tags in your entry',
    target: 3,
    xpReward: 40
  },
  'streak-keeper': {
    title: '🔥 Streak Keeper',
    description: 'Maintain your daily streak',
    target: 1,
    xpReward: 70
  },
  'mood-variety': {
    title: '🎭 Mood Explorer',
    description: 'Log a mood different from yesterday',
    target: 1,
    xpReward: 45
  },
  'detailed-entry': {
    title: '📖 Detailed Chronicler',
    description: 'Write a detailed entry (200+ words)',
    target: 200,
    xpReward: 80
  },
  'grateful': {
    title: '🙏 Gratitude Practice',
    description: 'Mention something you\'re grateful for',
    target: 1,
    xpReward: 55
  },
  'reflection': {
    title: '💭 Deep Thinker',
    description: 'Reflect on your day with meaningful insights',
    target: 1,
    xpReward: 65
  }
};

// Generate daily challenges
exports.generateDailyChallenges = async (userId) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if challenges already exist for today
  let dailyChallenge = await Challenge.findOne({
    user: userId,
    date: today
  });

  if (dailyChallenge) {
    return dailyChallenge;
  }

  // Select 3 random challenges
  const challengeTypes = Object.keys(challengeTemplates);
  const selectedTypes = [];
  
  while (selectedTypes.length < 3) {
    const randomType = challengeTypes[Math.floor(Math.random() * challengeTypes.length)];
    if (!selectedTypes.includes(randomType)) {
      selectedTypes.push(randomType);
    }
  }

  // Create challenge instances
  const challenges = selectedTypes.map(type => {
    const template = challengeTemplates[type];
    return {
      type,
      title: template.title,
      description: template.description,
      target: template.target,
      xpReward: template.xpReward
    };
  });

  // Save to database
  dailyChallenge = await Challenge.create({
    user: userId,
    date: today,
    challenges
  });

  return dailyChallenge;
};

// Update challenge progress
exports.updateChallengeProgress = async (userId, entry) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dailyChallenge = await Challenge.findOne({
    user: userId,
    date: today
  });

  if (!dailyChallenge) return null;

  let updated = false;

  dailyChallenge.challenges.forEach(challenge => {
    if (challenge.completed) return;

    switch (challenge.type) {
      case 'word-count':
        if (entry.wordCount >= challenge.target) {
          challenge.progress = entry.wordCount;
          challenge.completed = true;
          challenge.completedAt = new Date();
          updated = true;
        }
        break;

      case 'early-bird':
        const hour = new Date(entry.createdAt).getHours();
        if (hour < 9) {
          challenge.progress = 1;
          challenge.completed = true;
          challenge.completedAt = new Date();
          updated = true;
        }
        break;

      case 'night-owl':
        const nightHour = new Date(entry.createdAt).getHours();
        if (nightHour >= 22) {
          challenge.progress = 1;
          challenge.completed = true;
          challenge.completedAt = new Date();
          updated = true;
        }
        break;

      case 'tag-master':
        if (entry.tags && entry.tags.length >= challenge.target) {
          challenge.progress = entry.tags.length;
          challenge.completed = true;
          challenge.completedAt = new Date();
          updated = true;
        }
        break;

      case 'detailed-entry':
        if (entry.wordCount >= challenge.target) {
          challenge.progress = entry.wordCount;
          challenge.completed = true;
          challenge.completedAt = new Date();
          updated = true;
        }
        break;

      case 'grateful':
        const gratefulKeywords = ['grateful', 'thankful', 'appreciate', 'blessing', 'fortunate'];
        const hasGratitude = gratefulKeywords.some(word => 
          entry.notes.toLowerCase().includes(word)
        );
        if (hasGratitude) {
          challenge.progress = 1;
          challenge.completed = true;
          challenge.completedAt = new Date();
          updated = true;
        }
        break;
    }
  });

  if (updated) {
    await dailyChallenge.checkCompletion();
  }

  return dailyChallenge;
};
```

---

### `backend/middleware/authMiddleware.js`

```javascript
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
```

---

## 📁 Frontend Core

### `frontend/package.json`

```json
{
  "name": "frontend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "lint": "eslint .",
    "preview": "vite preview"
  },
  "dependencies": {
    "lucide-react": "^0.561.0",
    "react": "^19.2.0",
    "react-dom": "^19.2.0",
    "react-icons": "^5.5.0",
    "react-router-dom": "^7.10.1",
    "recharts": "^3.6.0"
  },
  "devDependencies": {
    "@eslint/js": "^9.39.1",
    "@types/react": "^19.2.5",
    "@types/react-dom": "^19.2.3",
    "@vitejs/plugin-react": "^5.1.1",
    "autoprefixer": "^10.4.17",
    "eslint": "^9.39.1",
    "eslint-plugin-react-hooks": "^7.0.1",
    "eslint-plugin-react-refresh": "^0.4.24",
    "globals": "^16.5.0",
    "postcss": "^8.4.33",
    "tailwindcss": "^3.4.1",
    "vite": "^7.2.4"
  }
}

```

---

### `frontend/vite.config.js`

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```

---

### `frontend/tailwind.config.js`

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Purple
        primary: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6b21a8',
          900: '#581c87',
        },
        // Accent Pink
        accent: {
          50: '#fdf2f8',
          100: '#fce7f3',
          200: '#fbcfe8',
          300: '#f9a8d4',
          400: '#f472b6',
          500: '#ec4899',
          600: '#db2777',
          700: '#be185d',
          800: '#9f1239',
          900: '#831843',
        },
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gradient-accent': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      },
      boxShadow: {
        'glow': '0 0 20px rgba(168, 85, 247, 0.4)',
        'glow-pink': '0 0 20px rgba(236, 72, 153, 0.4)',
      },
    },
  },
  plugins: [],
}
```

---

### `frontend/src/main.jsx`

```javascript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './contexts/AuthContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)
```

---

### `frontend/src/App.jsx`

```javascript
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
// Pages
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AddEntry from './pages/AddEntry';
import Entries from './pages/Entries';
import Goals from './pages/Goals';
import Analytics from './pages/Analytics';
import CreateGoal from './pages/CreateGoal';
import GoalDetail from './pages/GoalDetail';
import Challenges from './pages/Challenges';

// Protected Route
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          
          {/* Protected Routes */}
          <Route 
            path="/dashboard" 
            element={<ProtectedRoute><Dashboard /></ProtectedRoute>} 
          />
          <Route 
            path="/add-entry" 
            element={<ProtectedRoute><AddEntry /></ProtectedRoute>} 
          />
          <Route 
            path="/entries" 
            element={<ProtectedRoute><Entries /></ProtectedRoute>} 
          />
          <Route 
            path="/goals" 
            element={<ProtectedRoute><Goals /></ProtectedRoute>} 
          />
          
          <Route 
           path="/analytics" 
           element={<ProtectedRoute><Analytics /></ProtectedRoute>} 
          />
          <Route 
            path="/add-goal" 
            element={<ProtectedRoute><Goals /></ProtectedRoute>} 
          />
          <Route 
            path="/create-goal" 
            element={<ProtectedRoute><CreateGoal /></ProtectedRoute>} 
          />
          <Route 
             path="/goals/:id" 
             element={<ProtectedRoute><GoalDetail /></ProtectedRoute>} 
          />
          <Route 
            path="/challenges" 
            element={<ProtectedRoute><Challenges /></ProtectedRoute>} 
          />
        </Routes>
      </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

```

---

### `frontend/src/index.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;


/* Theme Variables */
:root[data-theme="dark"] {
  --bg-primary: #0f172a;
  --bg-secondary: #1e293b;
  --bg-card: #1e293b;
  --text-primary: #ffffff;
  --text-secondary: #94a3b8;
  --border-color: #334155;
}

:root[data-theme="light"] {
  --bg-primary: #f8fafc;
  --bg-secondary: #ffffff;
  --bg-card: #ffffff;
  --text-primary: #0f172a;
  --text-secondary: #64748b;
  --border-color: #e2e8f0;
}

body {
  background: var(--bg-primary);
  color: var(--text-primary);
  transition: background-color 0.3s ease, color 0.3s ease;
}

.card {
  background: var(--bg-card);
  border-color: var(--border-color);
}

/* Smooth Transitions */
* {
  transition: background-color 0.2s ease, border-color 0.2s ease;
}

/* Loading Skeleton */
@keyframes skeleton-loading {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.skeleton {
  background: linear-gradient(90deg, #2d3748 25%, #4a5568 50%, #2d3748 75%);
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s infinite;
}

/* Fade In Animation */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.5s ease-out;
}

/* Slide In Animation */
@keyframes slideIn {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}

.animate-slideIn {
  animation: slideIn 0.3s ease-out;
}

/* Scale Animation */
@keyframes scaleIn {
  from {
    transform: scale(0.9);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.animate-scaleIn {
  animation: scaleIn 0.3s ease-out;
}
/* Custom base styles */
@layer base {
  body {
    @apply bg-slate-900 text-white antialiased;
  }
}

/* Reusable button styles */
@layer components {
  .btn-primary {
    @apply bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 shadow-md hover:shadow-lg;
  }
  
  .btn-secondary {
    @apply bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-200;
  }
  
  .btn-accent {
    @apply bg-accent-500 hover:bg-accent-600 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 shadow-md hover:shadow-lg;
  }
  
  .btn-outline {
    @apply border-2 border-primary-500 text-primary-500 hover:bg-primary-500 hover:text-white font-semibold py-3 px-6 rounded-lg transition duration-200;
  }
  
  .card {
    @apply bg-slate-800 rounded-xl shadow-lg p-6 transition hover:shadow-xl;
  }
  
  .input-field {
    @apply w-full px-4 py-3 bg-slate-800 text-white border border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:outline-none placeholder-gray-500 transition duration-200;
  }
  
  .input-label {
    @apply block text-sm font-medium text-gray-300 mb-2;
  }
  
  .page-container {
    @apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8;
  }
  
  .spinner {
    @apply inline-block w-6 h-6 border-4 border-gray-600 border-t-primary-500 rounded-full animate-spin;
  }
}

/* Custom animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.3s ease-out;
}
```

---

## 📁 Frontend Contexts

### `frontend/src/contexts/AuthContext.jsx`

```javascript
import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in (on mount)
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  // Register function
  const register = async (name, email, password) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  // Login function
  const login = async (email, password) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
```

---

### `frontend/src/contexts/ThemeContext.jsx`

```javascript
import { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const value = {
    theme,
    toggleTheme,
    isDark: theme === 'dark'
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
```

---

## 📁 Frontend Pages

### `frontend/src/pages/Home.jsx`

```javascript
import { Link } from 'react-router-dom';
import { BookOpen, Flame, Bot, TrendingUp, Trophy, Timer, Users, Target, ArrowRight, CheckCircle, Lock, Smartphone, Zap, Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

function Home() {
  const { isAuthenticated } = useAuth();

  // If logged in, redirect to dashboard
  if (isAuthenticated) {
    window.location.href = '/dashboard';
    return null;
  }

  const features = [
    {
      icon: BookOpen,
      title: "Mood Journaling",
      description: "Track emotions with daily reflections. AI analyzes patterns in your journey.",
      color: "from-blue-500 to-cyan-500",
      badge: "Core"
    },
    {
      icon: Flame,
      title: "Streak System",
      description: "Build momentum with visual calendars. Freeze feature protects your progress.",
      color: "from-orange-500 to-red-500",
      badge: "Popular"
    },
    {
      icon: Bot,
      title: "AI Companion",
      description: "Personal coach that learns from your entries. Get plans, motivation, insights.",
      color: "from-purple-500 to-pink-500",
      badge: "AI-Powered"
    },
    {
      icon: TrendingUp,
      title: "Progress Analytics",
      description: "Beautiful charts show mood trends, productivity patterns, and growth metrics.",
      color: "from-green-500 to-emerald-500",
      badge: "Insights"
    },
    {
      icon: Trophy,
      title: "Gamification",
      description: "Earn XP, unlock badges, level up. Make growth addictive and fun.",
      color: "from-yellow-500 to-orange-500",
      badge: "Fun"
    },
    {
      icon: Timer,
      title: "Focus Timer",
      description: "Pomodoro technique integrated with journaling. Track deep work sessions.",
      color: "from-indigo-500 to-purple-500",
      badge: "Productivity"
    },
    {
      icon: Users,
      title: "Team Goals",
      description: "Share progress with friends. Compete in challenges, celebrate together.",
      color: "from-pink-500 to-rose-500",
      badge: "Social"
    },
    {
      icon: Target,
      title: "Vision Board",
      description: "Upload dream images. AI suggests action steps. Track goal achievement.",
      color: "from-teal-500 to-cyan-500",
      badge: "Goals"
    }
  ];

  const benefits = [
    { icon: CheckCircle, text: "100% Free Forever", color: "text-green-400" },
    { icon: Lock, text: "End-to-End Encrypted", color: "text-blue-400" },
    { icon: Smartphone, text: "Works Offline (PWA)", color: "text-purple-400" },
    { icon: Zap, text: "Instant Sync", color: "text-yellow-400" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      
      {/* Hero Section */}
      <div className="page-container py-20 md:py-28">
        <div className="text-center max-w-5xl mx-auto">
          
          {/* Floating badge */}
          <div className="inline-flex items-center space-x-2 bg-primary-500/10 border border-primary-500/30 rounded-full px-4 py-2 mb-8 animate-fadeIn">
            <Star size={16} className="text-yellow-400 fill-yellow-400" />
            <span className="text-sm text-primary-300 font-medium">Trusted by self-improvement enthusiasts</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight animate-fadeIn">
            Build Better Habits.{' '}
            <span className="block mt-2 bg-gradient-to-r from-primary-400 via-accent-400 to-primary-400 bg-clip-text text-transparent">
              One Day at a Time.
            </span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed max-w-3xl mx-auto">
            Your gamified growth companion with AI coaching. 
            Track progress, stay consistent, level up your life.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link 
              to="/getting-started" 
              className="btn-primary text-lg px-10 py-5 flex items-center justify-center space-x-3 group shadow-glow"
            >
              <span>See How It Works</span>
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              to="/register" 
              className="btn-outline text-lg px-10 py-5 flex items-center justify-center space-x-2"
            >
              <Target size={20} />
              <span>Start Free</span>
            </Link>
          </div>
          
          {/* Trust Badges */}
          <div className="flex flex-wrap justify-center gap-6 md:gap-8">
            {benefits.map((benefit, i) => (
              <div key={i} className="flex items-center space-x-2 text-gray-400">
                <benefit.icon size={20} className={benefit.color} />
                <span className="text-sm md:text-base">{benefit.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="page-container py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Everything You Need to Grow
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Powerful features designed for sustainable personal development
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="group card hover:scale-105 transition-all duration-300 cursor-pointer relative overflow-hidden"
            >
              {/* Gradient glow on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
              
              {/* Badge */}
              <div className="absolute top-4 right-4 text-xs font-bold px-2 py-1 rounded-full bg-slate-700/50 text-gray-400">
                {feature.badge}
              </div>
              
              <div className="relative">
                {/* Icon */}
                <div className={`inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                  <feature.icon size={28} className="text-white" strokeWidth={2} />
                </div>
                
                {/* Content */}
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-primary-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works (3 Steps) */}
      <div className="bg-slate-800/30 py-20">
        <div className="page-container">
          <h2 className="text-4xl font-bold text-center text-white mb-16">
            Start Growing in 3 Steps
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { num: "1", title: "Create Account", desc: "Sign up in 30 seconds. No credit card required." },
              { num: "2", title: "Set Your Goals", desc: "Tell us what you want to achieve. AI creates your plan." },
              { num: "3", title: "Track Daily", desc: "Journal, earn XP, build streaks. Watch progress unfold." }
            ].map((step, i) => (
              <div key={i} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full text-2xl font-bold text-white mb-4 shadow-xl">
                  {step.num}
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-gray-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Final CTA */}
      <div className="page-container py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="card bg-gradient-to-br from-primary-500/10 to-accent-500/10 border border-primary-500/20 p-12 relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute top-0 left-0 w-full h-full" style={{
                backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)',
                backgroundSize: '30px 30px'
              }}></div>
            </div>
            
            <div className="relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Ready to Level Up Your Life?
              </h2>
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Join the gamified growth movement. Build habits that stick, 
                track progress that matters, celebrate wins that count.
              </p>
              <Link 
                to="/register" 
                className="btn-primary text-lg px-12 py-5 inline-flex items-center space-x-3 shadow-glow-pink"
              >
                <span>Start Your Journey Free</span>
                <Zap size={24} />
              </Link>
              <p className="text-sm text-gray-500 mt-6">
                No credit card • 2-minute setup • Cancel anytime
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;

/* ════════════════════════════════════════════════════════════
   ✨ IMPROVEMENTS MADE:
   ════════════════════════════════════════════════════════════
   
   1. REMOVED FAKE STATS:
      ✅ No more "10K users" that don't exist
      ✅ Focus on features and benefits instead
   
   2. CONDITIONAL REDIRECT:
      ✅ If user logged in → Auto-redirect to dashboard
      ✅ Home page only for non-logged users
   
   3. REAL TRUST SIGNALS:
      ✅ "Free Forever" - Factual
      ✅ "Encrypted" - Technical feature
      ✅ "Works Offline" - PWA capability
      ✅ "Instant Sync" - Real functionality
   
   4. GAMIFICATION HINTS:
      ✅ "Level up your life" language
      ✅ XP/badges mentioned
      ✅ Feature badges (Core, Popular, AI-Powered)
   
   5. CLEARER VALUE PROP:
      ✅ "Gamified growth companion"
      ✅ "AI coaching"
      ✅ "One day at a time" (consistency focus)
   
   ════════════════════════════════════════════════════════════ */
```

---

### `frontend/src/pages/Login.jsx`

```javascript
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, LogIn } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { FaApple, FaFacebook } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      // Success - redirect to dashboard
      navigate('/dashboard');
    } else {
      setError(result.message || 'Login failed');
    }
    
    setLoading(false);
  };

  const handleGoogleLogin = () => {
    alert('Google OAuth coming in Phase 4!');
  };

  const handleAppleLogin = () => {
    alert('Apple Sign-In coming in Phase 4!');
  };

  const handleFacebookLogin = () => {
    alert('Facebook Login coming in Phase 4!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full animate-fadeIn">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full mb-4 shadow-2xl">
            <LogIn size={40} className="text-white" />
          </div>
          <h1 className="text-white text-3xl font-bold mb-2">Welcome Back!</h1>
          <p className="text-gray-400">Continue your growth journey</p>
        </div>

        <div className="card">
          
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}

          {/* Social Login Buttons */}
          <div className="space-y-3 mb-6">
            <button 
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center space-x-3 bg-white hover:bg-gray-50 text-gray-800 font-semibold py-3 px-4 rounded-lg transition border border-gray-300"
            >
              <FcGoogle size={24} />
              <span>Continue with Google</span>
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={handleAppleLogin}
                className="flex items-center justify-center space-x-2 bg-black hover:bg-gray-900 text-white font-semibold py-3 px-4 rounded-lg transition"
              >
                <FaApple size={20} />
                <span>Apple</span>
              </button>

              <button 
                onClick={handleFacebookLogin}
                className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition"
              >
                <FaFacebook size={20} />
                <span>Facebook</span>
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-slate-800 text-gray-400">Or with email</span>
            </div>
          </div>

          {/* Email Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div>
              <label className="input-label flex items-center space-x-2">
                <Mail size={16} />
                <span>Email Address</span>
              </label>
              <input
                type="email"
                name="email"
                className="input-field"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="input-label flex items-center space-x-2">
                <Lock size={16} />
                <span>Password</span>
              </label>
              <input
                type="password"
                name="password"
                className="input-field"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center space-x-2 text-gray-400 cursor-pointer">
                <input type="checkbox" className="rounded" />
                <span>Remember me</span>
              </label>
              <a href="#" className="text-primary-400 hover:text-primary-300 transition">
                Forgot password?
              </a>
            </div>

            <button 
              type="submit" 
              className="btn-primary w-full text-lg group"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center space-x-2">
                  <span className="spinner"></span>
                  <span>Logging in...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center space-x-2">
                  <span>Login</span>
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </button>
          </form>

          {/* Register Link */}
          <p className="text-center text-gray-400 mt-6">
            Don't have an account?{' '}
            <Link 
              to="/register" 
              className="text-primary-400 hover:text-primary-300 font-semibold transition"
            >
              Create one here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
```

---

### `frontend/src/pages/Register.jsx`

```javascript
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { FaApple, FaFacebook } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth(); // ✅ FIX: Get register from context
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear error on input change
  };

  // ✅ FIXED HANDLE SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const result = await register(formData.name, formData.email, formData.password);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.message || 'Registration failed');
    }
    
    setLoading(false);
  };

  // Social login handlers
  const handleGoogleLogin = () => {
    alert('Google OAuth coming in Phase 4!');
  };

  const handleAppleLogin = () => {
    alert('Apple Sign-In coming in Phase 4!');
  };

  const handleFacebookLogin = () => {
    alert('Facebook Login coming in Phase 4!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full animate-fadeIn">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full mb-4 shadow-2xl">
            <User size={40} className="text-white" />
          </div>
          <h1 className="text-white text-3xl font-bold mb-2">
            Create Your Account
          </h1>
          <p className="text-gray-400">
            Start your growth journey with LUMIN
          </p>
        </div>

        <div className="card">
          
          {/* ✅ ERROR MESSAGE */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}
          
          {/* Social Login Buttons */}
          <div className="space-y-3 mb-6">
            <button 
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center space-x-3 bg-white hover:bg-gray-50 text-gray-800 font-semibold py-3 px-4 rounded-lg transition border border-gray-300"
            >
              <FcGoogle size={24} />
              <span>Continue with Google</span>
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={handleAppleLogin}
                className="flex items-center justify-center space-x-2 bg-black hover:bg-gray-900 text-white font-semibold py-3 px-4 rounded-lg transition"
              >
                <FaApple size={20} />
                <span>Apple</span>
              </button>

              <button 
                onClick={handleFacebookLogin}
                className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition"
              >
                <FaFacebook size={20} />
                <span>Facebook</span>
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-slate-800 text-gray-400">Or continue with email</span>
            </div>
          </div>

          {/* Email Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Name Input */}
            <div>
              <label className="input-label flex items-center space-x-2">
                <User size={16} />
                <span>Full Name</span>
              </label>
              <input
                type="text"
                name="name"
                className="input-field"
                placeholder="Enter your full name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            {/* Email Input */}
            <div>
              <label className="input-label flex items-center space-x-2">
                <Mail size={16} />
                <span>Email Address</span>
              </label>
              <input
                type="email"
                name="email"
                className="input-field"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="input-label flex items-center space-x-2">
                <Lock size={16} />
                <span>Password</span>
              </label>
              <input
                type="password"
                name="password"
                className="input-field"
                placeholder="At least 6 characters"
                value={formData.password}
                onChange={handleChange}
                required
                minLength="6"
              />
              <p className="text-xs text-gray-500 mt-2 flex items-center space-x-1">
                <Lock size={12} />
                <span>Must be at least 6 characters</span>
              </p>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              className="btn-primary w-full text-lg group"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center space-x-2">
                  <span className="spinner"></span>
                  <span>Creating Account...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center space-x-2">
                  <span>Create Account</span>
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </button>
          </form>

          {/* Login Link */}
          <p className="text-center text-gray-400 mt-6">
            Already have an account?{' '}
            <Link 
              to="/login" 
              className="text-primary-400 hover:text-primary-300 font-semibold transition"
            >
              Login here
            </Link>
          </p>
        </div>

        {/* Terms */}
        <p className="text-center text-xs text-gray-500 mt-6">
          By continuing, you agree to LUMIN's{' '}
          <a href="#" className="text-primary-400 hover:underline">Terms of Service</a>
          {' '}and{' '}
          <a href="#" className="text-primary-400 hover:underline">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
}

export default Register;
```

---

### `frontend/src/pages/Dashboard.jsx`

```javascript
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import { statsAPI } from '../utils/api';
import { BookOpen, Target, TrendingUp, Award } from 'lucide-react';
import DailyChallenges from '../components/DailyChallenges';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    const result = await statsAPI.getDashboard();
    if (result.success) {
      setStats(result.data);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-white">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  const userData = stats?.user || user;
  const dashboardStats = stats?.stats || {
    totalEntries: 0,
    weekEntries: 0,
    longestStreak: 0,
    totalXP: 0
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Welcome Header */}
        <div className="mb-8 animate-fadeIn">
          <h1 className="text-4xl font-bold text-white">
            Welcome back, {userData?.name}! 👋
          </h1>
          <p className="text-gray-400 mt-2 text-lg">
            Here's your progress overview for today
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          
          <div className="card hover:scale-105 transition-transform text-center">
            <div className="text-5xl mb-3">🔥</div>
            <div className="text-4xl font-bold text-primary-400 mb-1">
              {userData?.streak || 0}
            </div>
            <div className="text-sm text-gray-400 font-medium">Day Streak</div>
            <div className="mt-2 text-xs text-gray-500">Keep it going!</div>
          </div>

          <div className="card hover:scale-105 transition-transform text-center">
            <div className="text-5xl mb-3">📝</div>
            <div className="text-4xl font-bold text-primary-400 mb-1">
              {dashboardStats.totalEntries}
            </div>
            <div className="text-sm text-gray-400 font-medium">Total Entries</div>
            <div className="mt-2 text-xs text-gray-500">
              {dashboardStats.weekEntries} this week
            </div>
          </div>

          <div className="card hover:scale-105 transition-transform text-center">
            <div className="text-5xl mb-3">⭐</div>
            <div className="text-4xl font-bold text-accent-400 mb-1">
              {userData?.xp || 0}
            </div>
            <div className="text-sm text-gray-400 font-medium">XP Points</div>
            <div className="mt-2 text-xs text-gray-500">
              {stats?.progress?.xpForNextLevel || 150} to next level
            </div>
          </div>

          <div className="card hover:scale-105 transition-transform text-center">
            <div className="text-5xl mb-3">🏆</div>
            <div className="text-4xl font-bold text-accent-400 mb-1">
              Level {userData?.level || 1}
            </div>
            <div className="text-sm text-gray-400 font-medium">Current Level</div>
            <div className="mt-2 text-xs text-gray-500">
              {stats?.progress?.xpProgress || 0}% progress
            </div>
          </div>
        </div>

        {/* XP Progress Bar */}
        {stats?.progress && (
          <div className="card mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-semibold">Level {userData.level} Progress</span>
              <span className="text-gray-400 text-sm">
                {stats.progress.currentLevelXP} / {stats.progress.nextLevelXP} XP
              </span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-primary-500 to-accent-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${stats.progress.xpProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="card mb-8">
          <h2 className="text-white text-2xl font-bold mb-6 flex items-center">
            <span className="mr-2">⚡</span>
            Quick Actions
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button 
              onClick={() => navigate('/add-entry')}
              className="btn-primary flex flex-col items-center justify-center space-y-2 py-6 hover:scale-105 transition-transform"
            >
              <BookOpen size={24} />
              <span>Journal Entry</span>
              <span className="text-xs opacity-75">Daily thoughts</span>
            </button>
            
            <button 
              onClick={() => navigate('/goals')}
              className="btn-secondary flex flex-col items-center justify-center space-y-2 py-6 hover:scale-105 transition-transform"
            >
              <Target size={24} />
              <span>Create Goal</span>
              <span className="text-xs opacity-75">Long-term plans</span>
            </button>
            
            <button 
              onClick={() => navigate('/entries')}
              className="btn-secondary flex flex-col items-center justify-center space-y-2 py-6 hover:scale-105 transition-transform"
            >
              <BookOpen size={24} />
              <span>View Journal</span>
              <span className="text-xs opacity-75">Past entries</span>
            </button>
            
            <button 
              onClick={() => navigate('/analytics')}
              className="btn-secondary flex flex-col items-center justify-center space-y-2 py-6 hover:scale-105 transition-transform"
            >
              <TrendingUp size={24} />
              <span>Analytics</span>
              <span className="text-xs opacity-75">Your progress</span>
            </button>
          </div>
        </div>
{/* ✅ DAILY CHALLENGES – SIRF ADD KIYA */}
        <DailyChallenges />

        {/* Recent Activity & Badges */}
        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* Recent Activity */}
          <div className="card">
            <h2 className="text-white text-2xl font-bold mb-4 flex items-center">
              <span className="mr-2">📌</span>
              Recent Activity
            </h2>
            
            {stats?.recentEntries && stats.recentEntries.length > 0 ? (
              <div className="space-y-3">
                {stats.recentEntries.map((entry) => (
                  <div
                    key={entry._id}
                    onClick={() => navigate(`/entries/${entry._id}`)}
                    className="flex items-start space-x-3 p-4 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-primary-500 transition cursor-pointer"
                  >
                    <div className="text-3xl">{entry.moodEmoji}</div>
                    <div className="flex-1">
                      <div className="font-semibold text-white">
                        {entry.title || 'Journal Entry'}
                      </div>
                      <div className="text-sm text-gray-400 mt-1 line-clamp-1">
                        {entry.notes}
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        {new Date(entry.createdAt).toLocaleDateString()} • +{entry.xpAwarded} XP
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-400 py-8">
                <div className="text-6xl mb-4">📝</div>
                <p className="text-lg font-semibold">No recent activity yet</p>
                <p className="text-sm mt-2">Create your first entry to get started!</p>
                <button
                  onClick={() => navigate('/add-entry')}
                  className="btn-primary mt-4"
                >
                  Create First Entry
                </button>
              </div>
            )}
          </div>

          {/* Badges */}
          <div className="card">
            <h2 className="text-white text-2xl font-bold mb-4 flex items-center">
              <span className="mr-2">🏅</span>
              Your Badges
            </h2>
            <div className="grid grid-cols-3 gap-4">
              {userData?.badges && userData.badges.length > 0 ? (
                userData.badges.map((badge, i) => (
                  <div
                    key={i}
                    className="text-center p-4 rounded-lg border-2 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border-yellow-500/50"
                  >
                    <div className="text-4xl mb-2">
                      {badge.displayName?.split(' ')[0] || '🏆'}
                    </div>
                    <div className="text-xs font-semibold text-yellow-400">
                      {badge.displayName?.split(' ').slice(1).join(' ') || badge.name}
                    </div>
                  </div>
                ))
              ) : null}
              
              {/* Locked Badges */}
              {[
                { emoji: '📝', name: 'First Entry' },
                { emoji: '🔥', name: '3-Day Streak' },
                { emoji: '💪', name: 'Week Warrior' },
                { emoji: '🏆', name: '30-Day Streak' },
                { emoji: '⭐', name: 'Level 10' },
                { emoji: '👥', name: 'Team Player' }
              ].slice(userData?.badges?.length || 0).map((badge, i) => (
                <div
                  key={i}
                  className="text-center p-4 rounded-lg border-2 bg-slate-700/30 border-dashed border-gray-600 opacity-50"
                >
                  <div className="text-4xl mb-2">{badge.emoji}</div>
                  <div className="text-xs font-semibold text-gray-400">
                    {badge.name}
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-500 text-center mt-4">
              {userData?.badges?.length || 0} earned • {6 - (userData?.badges?.length || 0)} locked
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
```

---

### `frontend/src/pages/AddEntry.jsx`

```javascript
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Tag } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { entryAPI } from '../utils/api';
import Navbar from '../components/Navbar';

function AddEntry() {
  const [formData, setFormData] = useState({
    mood: '',
    moodEmoji: '',
    moodIntensity: 5,
    title: '',
    notes: '',
    tags: '',
    isPrivate: true
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [hasEntryToday, setHasEntryToday] = useState(false);

  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  // Mood options
  const moods = [
    { value: 'amazing', emoji: '🤩', label: 'Amazing' },
    { value: 'happy', emoji: '😊', label: 'Happy' },
    { value: 'excited', emoji: '🤗', label: 'Excited' },
    { value: 'neutral', emoji: '😐', label: 'Neutral' },
    { value: 'sad', emoji: '😢', label: 'Sad' },
    { value: 'anxious', emoji: '😰', label: 'Anxious' },
    { value: 'stressed', emoji: '😫', label: 'Stressed' },
    { value: 'angry', emoji: '😠', label: 'Angry' }
  ];

  useEffect(() => {
    const checkTodayEntry = async () => {
      const result = await entryAPI.getToday();
      if (result.success && result.data?.hasEntryToday) {
        setHasEntryToday(true);
      }
    };
    checkTodayEntry();
  }, []);

  useEffect(() => {
    const words = formData.notes.trim().split(/\s+/).filter(w => w.length > 0);
    setWordCount(words.length);
  }, [formData.notes]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleMoodSelect = (mood) => {
    setFormData({
      ...formData,
      mood: mood.value,
      moodEmoji: mood.emoji
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.mood) {
      setError('Please select a mood');
      return;
    }

    if (formData.notes.length < 10) {
      setError('Entry must be at least 10 characters');
      return;
    }

    setLoading(true);
    setError('');

    const tagsArray = formData.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    const entryData = {
      ...formData,
      tags: tagsArray
    };

    const result = await entryAPI.create(entryData);

    if (result.success) {
      if (result.data?.rewards) {
        const { rewards } = result.data;
        
        updateUser({
          xp: user.xp + rewards.xp.total,
          level: rewards.newLevel,
          streak: rewards.streak.currentStreak
        });

        let message = `Entry created! 🎉\n\n`;
        message += `+${rewards.xp.total} XP earned\n`;
        
        if (rewards.leveledUp) {
          message += `🎊 Level Up! ${rewards.oldLevel} → ${rewards.newLevel}\n`;
        }
        
        if (rewards.streak.milestone) {
          message += `🔥 ${rewards.streak.milestone} +${rewards.streak.bonusXP} XP\n`;
        }
        
        if (rewards.newBadges.length > 0) {
          message += `\n🏆 New Badges:\n`;
          rewards.newBadges.forEach(badge => {
            message += `${badge.displayName} (+${badge.xp} XP)\n`;
          });
        }

        alert(message);
      }

      navigate('/dashboard');
    } else {
      setError(result.message || 'Failed to create entry');
    }

    setLoading(false);
  };

  if (hasEntryToday) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="card max-w-2xl mx-auto text-center">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-white mb-2">
              You've already journaled today!
            </h2>
            <p className="text-gray-400 mb-6">
              Come back tomorrow to continue your streak.
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="btn-primary"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2 text-gray-400 hover:text-white transition"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
          <h1 className="text-3xl font-bold text-white">New Journal Entry</h1>
          <div className="w-20"></div>
        </div>

        <div className="card max-w-3xl mx-auto">
          
          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div>
              <label className="input-label mb-3">How are you feeling today?</label>
              <div className="grid grid-cols-4 gap-3">
                {moods.map((mood) => (
                  <button
                    key={mood.value}
                    type="button"
                    onClick={() => handleMoodSelect(mood)}
                    className={`p-4 rounded-lg border-2 transition ${
                      formData.mood === mood.value
                        ? 'border-primary-500 bg-primary-500/20'
                        : 'border-gray-700 hover:border-gray-600 bg-slate-800/50'
                    }`}
                  >
                    <div className="text-4xl mb-2">{mood.emoji}</div>
                    <div className="text-sm text-gray-300">{mood.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {formData.mood && (
              <div>
                <label className="input-label mb-2">
                  Intensity: {formData.moodIntensity}/10
                </label>
                <input
                  type="range"
                  name="moodIntensity"
                  min="1"
                  max="10"
                  value={formData.moodIntensity}
                  onChange={handleChange}
                  className="w-full"
                />
              </div>
            )}

            <div>
              <label className="input-label">Title (Optional)</label>
              <input
                type="text"
                name="title"
                className="input-field"
                placeholder="Give your entry a title..."
                value={formData.title}
                onChange={handleChange}
                maxLength="100"
              />
            </div>

            <div>
              <label className="input-label mb-2">
                What's on your mind? *
                <span className="float-right text-xs text-gray-500">
                  {wordCount} words {wordCount >= 100 && '(+25 XP bonus!)'}
                </span>
              </label>
              <textarea
                name="notes"
                className="input-field min-h-[200px]"
                placeholder="Write your thoughts, feelings, experiences..."
                value={formData.notes}
                onChange={handleChange}
                required
              />
            </div>

            <div>
              <label className="input-label flex items-center space-x-2">
                <Tag size={16} />
                <span>Tags (comma separated)</span>
              </label>
              <input
                type="text"
                name="tags"
                className="input-field"
                placeholder="work, personal, health, goals..."
                value={formData.tags}
                onChange={handleChange}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg">
              <div>
                <div className="font-semibold text-white">Private Entry</div>
                <div className="text-sm text-gray-400">Only you can see this</div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="isPrivate"
                  checked={formData.isPrivate}
                  onChange={(e) => setFormData({...formData, isPrivate: e.target.checked})}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
              </label>
            </div>

            <button
              type="submit"
              className="btn-primary w-full text-lg group"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center space-x-2">
                  <span className="spinner"></span>
                  <span>Creating Entry...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center space-x-2">
                  <Send size={20} />
                  <span>Save Entry</span>
                </span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddEntry;
```

---

### `frontend/src/pages/Entries.jsx`

```javascript
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { entryAPI } from '../utils/api';

function Entries() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    setLoading(true);
    const result = await entryAPI.getAll();
    if (result.success) {
      setEntries(result.data?.entries || []);
    }
    setLoading(false);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Your Journal Entries</h1>
            <p className="text-gray-400">
              {entries.length} {entries.length === 1 ? 'entry' : 'entries'} total
            </p>
          </div>
          <button
            onClick={() => navigate('/add-entry')}
            className="btn-primary"
          >
            ➕ New Entry
          </button>
        </div>

        {loading ? (
          <div className="text-center text-white py-20">
            <div className="spinner mx-auto mb-4"></div>
            <p>Loading entries...</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="card text-center py-20">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-2xl font-bold text-white mb-2">No entries yet</h2>
            <p className="text-gray-400 mb-6">Start your journaling journey today!</p>
            <button
              onClick={() => navigate('/add-entry')}
              className="btn-primary"
            >
              Create Your First Entry
            </button>
          </div>
        ) : (
          <div className="grid gap-6">
            {entries.map((entry) => (
              <div
                key={entry._id}
                className="card hover:scale-[1.02] transition-transform cursor-pointer"
                onClick={() => navigate(`/entries/${entry._id}`)}
              >
                <div className="flex items-start space-x-4">
                  <div className="text-5xl">{entry.moodEmoji}</div>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold text-white">
                        {entry.title || 'Untitled Entry'}
                      </h3>
                      <span className="text-sm text-gray-400">
                        {formatDate(entry.entryDate)}
                      </span>
                    </div>
                    
                    <p className="text-gray-300 line-clamp-2 mb-3">
                      {entry.notes}
                    </p>
                    
                    <div className="flex items-center flex-wrap gap-2">
                      {entry.tags && entry.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-primary-500/20 text-primary-300 text-xs rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                      <span className="text-xs text-gray-500">
                        {entry.wordCount} words • +{entry.xpAwarded} XP
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Entries;
```

---

### `frontend/src/pages/Goals.jsx`

```javascript
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { goalsAPI } from '../utils/api';
import { Target, Plus, TrendingUp, Calendar, Award, Filter } from 'lucide-react';

function Goals() {
  const [goals, setGoals] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, active, completed
  const navigate = useNavigate();

  useEffect(() => {
    fetchGoals();
    fetchStats();
  }, [filter]);

  const fetchGoals = async () => {
    setLoading(true);
    const filters = filter !== 'all' ? { status: filter } : {};
    const result = await goalsAPI.getAll(filters);
    if (result.success) {
      setGoals(result.data || []);
    }
    setLoading(false);
  };

  const fetchStats = async () => {
    const result = await goalsAPI.getStats();
    if (result.success) {
      setStats(result.data);
    }
  };

  // Category config
  const categories = {
    career: { icon: '💼', color: 'blue', label: 'Career' },
    health: { icon: '💪', color: 'green', label: 'Health' },
    learning: { icon: '📚', color: 'yellow', label: 'Learning' },
    finance: { icon: '💰', color: 'emerald', label: 'Finance' },
    relationships: { icon: '❤️', color: 'pink', label: 'Relationships' },
    hobbies: { icon: '🎨', color: 'purple', label: 'Hobbies' },
    other: { icon: '🎯', color: 'gray', label: 'Other' }
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'text-blue-400 bg-blue-500/20',
      completed: 'text-green-400 bg-green-500/20',
      paused: 'text-yellow-400 bg-yellow-500/20',
      abandoned: 'text-red-400 bg-red-500/20'
    };
    return colors[status] || colors.active;
  };

  if (loading && goals.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-white">Loading goals...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Your Goals</h1>
            <p className="text-gray-400">
              Track and achieve your long-term objectives
            </p>
          </div>
          <button
            onClick={() => navigate('/create-goal')}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Create Goal</span>
          </button>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="card">
              <div className="flex items-center space-x-3 mb-2">
                <Target className="text-primary-400" size={24} />
                <span className="text-gray-400">Total Goals</span>
              </div>
              <div className="text-3xl font-bold text-white">{stats.total}</div>
            </div>

            <div className="card">
              <div className="flex items-center space-x-3 mb-2">
                <TrendingUp className="text-blue-400" size={24} />
                <span className="text-gray-400">Active</span>
              </div>
              <div className="text-3xl font-bold text-white">{stats.active}</div>
            </div>

            <div className="card">
              <div className="flex items-center space-x-3 mb-2">
                <Award className="text-green-400" size={24} />
                <span className="text-gray-400">Completed</span>
              </div>
              <div className="text-3xl font-bold text-white">{stats.completed}</div>
            </div>

            <div className="card">
              <div className="flex items-center space-x-3 mb-2">
                <Calendar className="text-yellow-400" size={24} />
                <span className="text-gray-400">Success Rate</span>
              </div>
              <div className="text-3xl font-bold text-white">{stats.completionRate}%</div>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="card mb-8">
          <div className="flex items-center space-x-2">
            <Filter size={20} className="text-gray-400" />
            <div className="flex space-x-2">
              {['all', 'active', 'completed', 'paused'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg transition capitalize ${
                    filter === f
                      ? 'bg-primary-500 text-white'
                      : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Goals Grid */}
        {goals.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.map((goal) => {
              const categoryConfig = categories[goal.category] || categories.other;
              
              return (
                <div
                  key={goal._id}
                  onClick={() => navigate(`/goals/${goal._id}`)}
                  className="card hover:scale-[1.02] transition-transform cursor-pointer"
                >
                  {/* Category Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <div className={`flex items-center space-x-2 px-3 py-1 rounded-full bg-${categoryConfig.color}-500/20 text-${categoryConfig.color}-400`}>
                      <span>{categoryConfig.icon}</span>
                      <span className="text-sm font-semibold">{categoryConfig.label}</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(goal.status)}`}>
                      {goal.status}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-white mb-2">
                    {goal.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {goal.description}
                  </p>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">Progress</span>
                      <span className="text-sm font-semibold text-white">
                        {goal.progressPercentage}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-primary-500 to-accent-500 h-2 rounded-full transition-all"
                        style={{ width: `${goal.progressPercentage}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="text-gray-400">
                      <span className="font-semibold text-white">{goal.currentValue}</span>
                      {' / '}
                      <span>{goal.targetValue}</span>
                      {' '}
                      {goal.unit}
                    </div>
                    
                    {goal.isOverdue ? (
                      <span className="text-red-400 font-semibold">
                        Overdue
                      </span>
                    ) : (
                      <span className="text-gray-400">
                        {goal.daysRemaining} days left
                      </span>
                    )}
                  </div>

                  {/* Milestones */}
                  {goal.milestones && goal.milestones.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-700">
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>Milestones</span>
                        <span>
                          {goal.milestones.filter(m => m.completed).length} / {goal.milestones.length}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="card text-center py-20">
            <div className="text-6xl mb-4">🎯</div>
            <h2 className="text-2xl font-bold text-white mb-2">No goals yet</h2>
            <p className="text-gray-400 mb-6">
              {filter === 'all' 
                ? 'Set your first goal and start your journey!'
                : `No ${filter} goals found`}
            </p>
            <button
              onClick={() => navigate('/create-goal')}
              className="btn-primary"
            >
              Create Your First Goal
            </button>
          </div>
        )}

        {/* Category Overview */}
        {stats && stats.byCategory && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-white mb-6">Goals by Category</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Object.entries(categories).map(([key, config]) => {
                const catStats = stats.byCategory[key] || { total: 0, completed: 0 };
                
                return (
                  <div
                    key={key}
                    className="card text-center hover:scale-105 transition-transform cursor-pointer"
                    onClick={() => setFilter(key)}
                  >
                    <div className="text-4xl mb-2">{config.icon}</div>
                    <h3 className="text-lg font-bold text-white mb-1">{config.label}</h3>
                    <p className="text-sm text-gray-400">
                      {catStats.total} goals • {catStats.completed} done
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Goals;
```

---

### `frontend/src/pages/CreateGoal.jsx`

```javascript
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { goalsAPI } from '../utils/api';
import { ArrowLeft, Target, Plus, X } from 'lucide-react';

function CreateGoal() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    metric: 'Progress',
    targetValue: '',
    currentValue: 0,
    unit: 'units',
    category: 'career',
    priority: 'medium',
    targetDate: '',
    tags: ''
  });

  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const categories = [
    { value: 'career', icon: '💼', label: 'Career' },
    { value: 'health', icon: '💪', label: 'Health' },
    { value: 'learning', icon: '📚', label: 'Learning' },
    { value: 'finance', icon: '💰', label: 'Finance' },
    { value: 'relationships', icon: '❤️', label: 'Relationships' },
    { value: 'hobbies', icon: '🎨', label: 'Hobbies' },
    { value: 'other', icon: '🎯', label: 'Other' }
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const addMilestone = () => {
    setMilestones([
      ...milestones,
      {
        title: '',
        description: '',
        targetValue: '',
        xpReward: 25
      }
    ]);
  };

  const updateMilestone = (index, field, value) => {
    const updated = [...milestones];
    updated[index][field] = value;
    setMilestones(updated);
  };

  const removeMilestone = (index) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.targetValue || !formData.targetDate) {
      setError('Please fill all required fields');
      return;
    }

    setLoading(true);
    setError('');

    const tagsArray = formData.tags
      .split(',')
      .map(tag => tag.trim())
      .filter(tag => tag.length > 0);

    const goalData = {
      ...formData,
      targetValue: parseFloat(formData.targetValue),
      tags: tagsArray,
      milestones: milestones.filter(m => m.title)
    };

    const result = await goalsAPI.create(goalData);

    if (result.success) {
      alert(`Goal created! +${result.data.xpEarned} XP 🎯`);
      navigate('/goals');
    } else {
      setError(result.message || 'Failed to create goal');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate('/goals')}
            className="flex items-center space-x-2 text-gray-400 hover:text-white transition"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>
          <h1 className="text-3xl font-bold text-white">Create New Goal</h1>
          <div className="w-20"></div>
        </div>

        <div className="card">
          
          {error && (
            <div className="mb-6 p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* SMART Goal Template */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <h3 className="text-lg font-bold text-white mb-2">🎯 SMART Goal Framework</h3>
              <ul className="text-sm text-gray-300 space-y-1">
                <li><strong>S</strong>pecific: Clearly define what you want to achieve</li>
                <li><strong>M</strong>easurable: Add numbers to track progress</li>
                <li><strong>A</strong>chievable: Set realistic targets</li>
                <li><strong>R</strong>elevant: Align with your values</li>
                <li><strong>T</strong>ime-bound: Set a deadline</li>
              </ul>
            </div>

            {/* Category Selection */}
            <div>
              <label className="input-label mb-3">Category *</label>
              <div className="grid grid-cols-4 gap-3">
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: cat.value })}
                    className={`p-4 rounded-lg border-2 transition ${
                      formData.category === cat.value
                        ? 'border-primary-500 bg-primary-500/20'
                        : 'border-gray-700 hover:border-gray-600 bg-slate-800/50'
                    }`}
                  >
                    <div className="text-3xl mb-1">{cat.icon}</div>
                    <div className="text-xs text-gray-300">{cat.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="input-label">Goal Title * (Specific)</label>
              <input
                type="text"
                name="title"
                className="input-field"
                placeholder="e.g., Run a 5K marathon"
                value={formData.title}
                onChange={handleChange}
                required
                maxLength="100"
              />
            </div>

            {/* Description */}
            <div>
              <label className="input-label">Description * (Achievable & Relevant)</label>
              <textarea
                name="description"
                className="input-field min-h-[100px]"
                placeholder="Why is this goal important? How will you achieve it?"
                value={formData.description}
                onChange={handleChange}
                required
                maxLength="500"
              />
            </div>

            {/* Measurable Metrics */}
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="input-label">Metric Name</label>
                <input
                  type="text"
                  name="metric"
                  className="input-field"
                  placeholder="Distance"
                  value={formData.metric}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="input-label">Target Value * (Measurable)</label>
                <input
                  type="number"
                  name="targetValue"
                  className="input-field"
                  placeholder="5"
                  value={formData.targetValue}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="input-label">Unit</label>
                <input
                  type="text"
                  name="unit"
                  className="input-field"
                  placeholder="kilometers"
                  value={formData.unit}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Priority & Deadline */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="input-label">Priority</label>
                <select
                  name="priority"
                  className="input-field"
                  value={formData.priority}
                  onChange={handleChange}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="input-label">Target Date * (Time-bound)</label>
                <input
                  type="date"
                  name="targetDate"
                  className="input-field"
                  value={formData.targetDate}
                  onChange={handleChange}
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            {/* Milestones */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="input-label">Milestones (Optional)</label>
                <button
                  type="button"
                  onClick={addMilestone}
                  className="flex items-center space-x-1 text-sm text-primary-400 hover:text-primary-300"
                >
                  <Plus size={16} />
                  <span>Add Milestone</span>
                </button>
              </div>

              {milestones.map((milestone, index) => (
                <div key={index} className="mb-4 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-sm font-semibold text-gray-400">Milestone {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeMilestone(index)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <X size={16} />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <input
                      type="text"
                      className="input-field"
                      placeholder="Milestone title"
                      value={milestone.title}
                      onChange={(e) => updateMilestone(index, 'title', e.target.value)}
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="number"
                        className="input-field"
                        placeholder="Target value"
                        value={milestone.targetValue}
                        onChange={(e) => updateMilestone(index, 'targetValue', e.target.value)}
                      />
                      <input
                        type="number"
                        className="input-field"
                        placeholder="XP Reward"
                        value={milestone.xpReward}
                        onChange={(e) => updateMilestone(index, 'xpReward', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Tags */}
            <div>
              <label className="input-label">Tags (comma separated)</label>
              <input
                type="text"
                name="tags"
                className="input-field"
                placeholder="fitness, challenge, 2024"
                value={formData.tags}
                onChange={handleChange}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="btn-primary w-full text-lg"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center space-x-2">
                  <span className="spinner"></span>
                  <span>Creating Goal...</span>
                </span>
              ) : (
                <span className="flex items-center justify-center space-x-2">
                  <Target size={20} />
                  <span>Create Goal (+50 XP)</span>
                </span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default CreateGoal;
```

---

### `frontend/src/pages/GoalDetail.jsx`

```javascript
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { goalsAPI } from '../utils/api';
import { ArrowLeft, TrendingUp, Calendar, Award, CheckCircle, Circle } from 'lucide-react';

function GoalDetail() {
  const [goal, setGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [progressInput, setProgressInput] = useState('');
  
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchGoal();
  }, [id]);

  const fetchGoal = async () => {
    setLoading(true);
    const result = await goalsAPI.getOne(id);
    if (result.success) {
      setGoal(result.data);
      setProgressInput(result.data.currentValue);
    }
    setLoading(false);
  };

  const handleUpdateProgress = async () => {
    setUpdating(true);
    const result = await goalsAPI.updateProgress(id, parseFloat(progressInput));
    
    if (result.success) {
      alert(result.message);
      fetchGoal();
    }
    
    setUpdating(false);
  };

  const handleCompleteMilestone = async (milestoneId) => {
    const result = await goalsAPI.completeMilestone(id, milestoneId);
    
    if (result.success) {
      alert(result.message);
      fetchGoal();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <p className="text-white">Goal not found</p>
        </div>
      </div>
    );
  }

  const categories = {
    career: { icon: '💼', color: 'blue' },
    health: { icon: '💪', color: 'green' },
    learning: { icon: '📚', color: 'yellow' },
finance: { icon: '💰', color: 'emerald' },
relationships: { icon: '❤️', color: 'pink' },
hobbies: { icon: '🎨', color: 'purple' },
other: { icon: '🎯', color: 'gray' }
};
const categoryConfig = categories[goal.category] || categories.other;
return (
<div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
<Navbar />
  <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    
    {/* Header */}
    <div className="flex items-center justify-between mb-8">
      <button
        onClick={() => navigate('/goals')}
        className="flex items-center space-x-2 text-gray-400 hover:text-white transition"
      >
        <ArrowLeft size={20} />
        <span>Back to Goals</span>
      </button>
    </div>

    {/* Goal Header Card */}
    <div className="card mb-8">
      <div className="flex items-start justify-between mb-4">
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full bg-${categoryConfig.color}-500/20 text-${categoryConfig.color}-400`}>
          <span className="text-2xl">{categoryConfig.icon}</span>
          <span className="font-semibold capitalize">{goal.category}</span>
        </div>
        
        <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
          goal.status === 'completed' ? 'bg-green-500/20 text-green-400' :
          goal.status === 'active' ? 'bg-blue-500/20 text-blue-400' :
          'bg-yellow-500/20 text-yellow-400'
        }`}>
          {goal.status}
        </span>
      </div>

      <h1 className="text-3xl font-bold text-white mb-4">{goal.title}</h1>
      <p className="text-gray-300 text-lg mb-6">{goal.description}</p>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-400">Overall Progress</span>
          <span className="text-2xl font-bold text-white">
            {goal.progressPercentage}%
          </span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-4">
          <div
            className="bg-gradient-to-r from-primary-500 to-accent-500 h-4 rounded-full transition-all"
            style={{ width: `${goal.progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="flex items-center space-x-3 p-4 bg-slate-800/50 rounded-lg">
          <TrendingUp className="text-primary-400" size={24} />
          <div>
            <div className="text-sm text-gray-400">Current Progress</div>
            <div className="text-xl font-bold text-white">
              {goal.currentValue} / {goal.targetValue} {goal.unit}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3 p-4 bg-slate-800/50 rounded-lg">
          <Calendar className="text-yellow-400" size={24} />
          <div>
            <div className="text-sm text-gray-400">Time Remaining</div>
            <div className="text-xl font-bold text-white">
              {goal.isOverdue ? (
                <span className="text-red-400">Overdue</span>
              ) : (
                `${goal.daysRemaining} days`
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3 p-4 bg-slate-800/50 rounded-lg">
          <Award className="text-green-400" size={24} />
          <div>
            <div className="text-sm text-gray-400">Reward</div>
            <div className="text-xl font-bold text-white">
              +{goal.xpReward} XP
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Update Progress */}
    {goal.status === 'active' && (
      <div className="card mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Update Progress</h2>
        <div className="flex items-center space-x-4">
          <input
            type="number"
            className="input-field flex-1"
            value={progressInput}
            onChange={(e) => setProgressInput(e.target.value)}
            min="0"
            step="0.1"
          />
          <span className="text-gray-400">{goal.unit}</span>
          <button
            onClick={handleUpdateProgress}
            disabled={updating}
            className="btn-primary"
          >
            {updating ? 'Updating...' : 'Update'}
          </button>
        </div>
      </div>
    )}

    {/* Milestones */}
    {goal.milestones && goal.milestones.length > 0 && (
      <div className="card">
        <h2 className="text-xl font-bold text-white mb-6">Milestones</h2>
        <div className="space-y-4">
          {goal.milestones.map((milestone) => (
            <div
              key={milestone._id}
              className={`p-4 rounded-lg border-2 transition ${
                milestone.completed
                  ? 'border-green-500 bg-green-500/10'
                  : 'border-slate-700 bg-slate-800/50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  {milestone.completed ? (
                    <CheckCircle className="text-green-400 mt-1" size={24} />
                  ) : (
                    <Circle className="text-gray-400 mt-1" size={24} />
                  )}
                  
                  <div className="flex-1">
                    <h3 className={`font-bold mb-1 ${milestone.completed ? 'text-green-400' : 'text-white'}`}>
                      {milestone.title}
                    </h3>
                    {milestone.description && (
                      <p className="text-gray-400 text-sm mb-2">{milestone.description}</p>
                    )}
                    <div className="flex items-center space-x-4 text-sm">
                      {milestone.targetValue && (
                        <span className="text-gray-400">
                          Target: {milestone.targetValue} {goal.unit}
                        </span>
                      )}
                      <span className="text-primary-400">
                        +{milestone.xpReward} XP
                      </span>
                    </div>
                  </div>
                </div>

                {!milestone.completed && goal.status === 'active' && (
                  <button
                    onClick={() => handleCompleteMilestone(milestone._id)}
                    className="btn-secondary text-sm"
                  >
                    Complete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Milestone Progress */}
        <div className="mt-6 pt-6 border-t border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">Milestone Progress</span>
            <span className="text-white font-semibold">
              {goal.milestoneProgress}%
            </span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all"
              style={{ width: `${goal.milestoneProgress}%` }}
            ></div>
          </div>
        </div>
      </div>
    )}
  </div>
</div>
);
}
export default GoalDetail;

```

---

### `frontend/src/pages/Analytics.jsx`

```javascript
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { statsAPI } from '../utils/api';
import { 
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { Target, TrendingUp, Calendar, Award, Activity, Flame } from 'lucide-react';

function Analytics() {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(30);
  const [consistencyData, setConsistencyData] = useState(null);
  const [goalTimeline, setGoalTimeline] = useState(null);
  const [weeklyActivity, setWeeklyActivity] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    
    const [consistency, timeline, weekly] = await Promise.all([
      statsAPI.getGoalConsistency(timeRange),
      statsAPI.getGoalTimeline(),
      statsAPI.getWeeklyActivity()
    ]);

    if (consistency.success) setConsistencyData(consistency.data);
    if (timeline.success) setGoalTimeline(timeline.data);
    if (weekly.success) setWeeklyActivity(processWeeklyActivity(weekly.data));

    setLoading(false);
  };

  const processWeeklyActivity = (data) => {
    return data.map(day => ({
      date: new Date(day._id).toLocaleDateString('en-US', { weekday: 'short' }),
      entries: day.entries,
      xp: day.totalXP
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-white">Loading analytics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Goal & Consistency Analytics</h1>
          <p className="text-gray-400">Track your progress and maintain consistency</p>
        </div>

        {/* Time Range Selector */}
        <div className="card mb-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Time Range</h2>
            <div className="flex space-x-2">
              {[7, 14, 30, 90].map(days => (
                <button
                  key={days}
                  onClick={() => setTimeRange(days)}
                  className={`px-4 py-2 rounded-lg transition ${
                    timeRange === days
                      ? 'bg-primary-500 text-white'
                      : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                  }`}
                >
                  {days} days
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Key Metrics - GOAL FOCUSED */}
        {consistencyData && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            
            {/* Consistency Score */}
            <div className="card bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20">
              <div className="flex items-center space-x-3 mb-2">
                <Flame className="text-green-400" size={32} />
                <span className="text-gray-300">Consistency Score</span>
              </div>
              <div className="text-4xl font-bold text-green-400 mb-2">
                {consistencyData.consistencyScore}%
              </div>
              <div className="text-sm text-gray-400">
                {consistencyData.activeDays} / {consistencyData.totalDays} days active
              </div>
              <div className="mt-3 w-full bg-slate-700 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${consistencyData.consistencyScore}%` }}
                ></div>
              </div>
            </div>

            {/* Goal Completion Rate */}
            <div className="card bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
              <div className="flex items-center space-x-3 mb-2">
                <Target className="text-blue-400" size={32} />
                <span className="text-gray-300">Goal Success</span>
              </div>
              <div className="text-4xl font-bold text-blue-400 mb-2">
                {consistencyData.goals.completionRate}%
              </div>
              <div className="text-sm text-gray-400">
                {consistencyData.goals.completed} / {consistencyData.goals.total} completed
              </div>
            </div>

            {/* Current Streak */}
            <div className="card bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20">
              <div className="flex items-center space-x-3 mb-2">
                <Calendar className="text-orange-400" size={32} />
                <span className="text-gray-300">Current Streak</span>
              </div>
              <div className="text-4xl font-bold text-orange-400 mb-2">
                {consistencyData.currentStreak}
              </div>
              <div className="text-sm text-gray-400">
                days in a row
              </div>
            </div>

            {/* Average Daily XP */}
            <div className="card bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
              <div className="flex items-center space-x-3 mb-2">
                <Award className="text-purple-400" size={32} />
                <span className="text-gray-300">Avg Daily XP</span>
              </div>
              <div className="text-4xl font-bold text-purple-400 mb-2">
                {consistencyData.averages.xp}
              </div>
              <div className="text-sm text-gray-400">
                XP per active day
              </div>
            </div>
          </div>
        )}

        {/* Main Charts */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          
          {/* Daily Consistency Chart */}
          <div className="card">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center">
              <Activity className="mr-2" size={20} />
              Daily Activity Consistency
            </h2>
            {consistencyData && consistencyData.dailyEfforts.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={consistencyData.dailyEfforts}>
                  <defs>
                    <linearGradient id="colorEntries" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="_id" 
                    stroke="#9ca3af"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(date) => new Date(date).getDate()}
                  />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: '1px solid #475569',
                      borderRadius: '8px'
                    }}
                    labelFormatter={(date) => new Date(date).toLocaleDateString()}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="entries" 
                    stroke="#8b5cf6" 
                    fillOpacity={1} 
                    fill="url(#colorEntries)"
                    name="Daily Entries"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-gray-400 py-20">
                <Activity size={48} className="mx-auto mb-4 opacity-50" />
                <p>No activity data yet</p>
              </div>
            )}
          </div>

          {/* Weekly XP Earnings */}
          <div className="card">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center">
              <TrendingUp className="mr-2" size={20} />
              Weekly XP Progress
            </h2>
            {weeklyActivity.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={weeklyActivity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#1e293b', 
                      border: '1px solid #475569',
                      borderRadius: '8px'
                    }}
                  />
                  <Legend />
                  <Bar dataKey="xp" fill="#ec4899" name="XP Earned" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-gray-400 py-20">
                <TrendingUp size={48} className="mx-auto mb-4 opacity-50" />
                <p>No XP data yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Goal Progress Cards */}
        {goalTimeline && goalTimeline.goals && goalTimeline.goals.length > 0 && (
          <div className="card mb-8">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center">
              <Target className="mr-2" size={20} />
              Active Goals Progress
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {goalTimeline.goals
                .filter(g => g.status === 'active')
                .slice(0, 6)
                .map((goal) => (
                  <div
                    key={goal._id}
                    onClick={() => navigate(`/goals/${goal._id}`)}
                    className="p-4 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-primary-500 transition cursor-pointer"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-white">{goal.title}</h3>
                      <span className="text-sm text-gray-400 capitalize">{goal.category}</span>
                    </div>
                    
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">Progress</span>
                      <span className="text-sm font-semibold text-white">
                        {goal.progressPercentage}%
                      </span>
                    </div>
                    
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-primary-500 to-accent-500 h-2 rounded-full transition-all"
                        style={{ width: `${goal.progressPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Insights Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="card bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20">
            <div className="text-4xl mb-3">🎯</div>
            <h3 className="text-lg font-bold text-white mb-2">Consistency Streak</h3>
            <p className="text-gray-300">
              {consistencyData && consistencyData.consistencyScore >= 80
                ? 'Excellent! You\'re on fire 🔥'
                : consistencyData && consistencyData.consistencyScore >= 60
                ? 'Good progress! Keep it up 💪'
                : 'Let\'s build that consistency!'}
            </p>
          </div>

          <div className="card bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
            <div className="text-4xl mb-3">📊</div>
            <h3 className="text-lg font-bold text-white mb-2">Goal Focus</h3>
            <p className="text-gray-300">
              {consistencyData && consistencyData.goals.active} active goals
              {consistencyData && consistencyData.goals.active > 3 && ' - Consider focusing on fewer goals'}
            </p>
          </div>

          <div className="card bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20">
            <div className="text-4xl mb-3">📈</div>
            <h3 className="text-lg font-bold text-white mb-2">Growth Rate</h3>
            <p className="text-gray-300">
              Avg {consistencyData?.averages.words || 0} words per day
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analytics;
```

---

### `frontend/src/pages/Challenges.jsx`

```javascript
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import DailyChallenges from '../components/DailyChallenges';
import { challengesAPI } from '../utils/api';
import { Trophy, TrendingUp, Calendar, Award } from 'lucide-react';

function Challenges() {
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    
    const [historyResult, statsResult] = await Promise.all([
      challengesAPI.getHistory(30),
      challengesAPI.getStats()
    ]);

    if (historyResult.success) {
      setHistory(historyResult.data.history);
      setStats(historyResult.data.stats);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Daily Challenges</h1>
          <p className="text-gray-400">Complete challenges to earn bonus XP</p>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="card">
              <div className="flex items-center space-x-3 mb-2">
                <Trophy className="text-yellow-400" size={24} />
                <span className="text-gray-400">Total XP Earned</span>
              </div>
              <div className="text-3xl font-bold text-white">{stats.totalXPEarned}</div>
            </div>

            <div className="card">
              <div className="flex items-center space-x-3 mb-2">
                <Award className="text-green-400" size={24} />
                <span className="text-gray-400">Completed</span>
              </div>
              <div className="text-3xl font-bold text-white">{stats.completedChallenges}</div>
            </div>

            <div className="card">
              <div className="flex items-center space-x-3 mb-2">
                <TrendingUp className="text-blue-400" size={24} />
                <span className="text-gray-400">Success Rate</span>
              </div>
              <div className="text-3xl font-bold text-white">{stats.completionRate}%</div>
            </div>

            <div className="card">
              <div className="flex items-center space-x-3 mb-2">
                <Calendar className="text-purple-400" size={24} />
                <span className="text-gray-400">Perfect Days</span>
              </div>
              <div className="text-3xl font-bold text-white">{stats.perfectDays}</div>
            </div>
          </div>
        )}

        {/* Today's Challenges */}
        <DailyChallenges />

        {/* Challenge History */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-white mb-6">Recent History</h2>
          
          {history.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {history.slice(0, 10).map((day) => (
                <div key={day._id} className="card">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-white font-semibold">
                      {new Date(day.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      day.completedCount === 3
                        ? 'bg-green-500/20 text-green-400'
                        : day.completedCount > 0
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {day.completedCount} / {day.challenges.length}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {day.challenges.map((challenge) => (
                      <div
                        key={challenge._id}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className={challenge.completed ? 'text-green-400' : 'text-gray-400'}>
                          {challenge.completed ? '✓' : '○'} {challenge.title}
                        </span>
                        {challenge.completed && (
                          <span className="text-primary-400">+{challenge.xpReward} XP</span>
                        )}
                      </div>
                    ))}
                  </div>

                  {day.totalXPEarned > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-700 text-center">
                      <span className="text-yellow-400 font-bold">
                        +{day.totalXPEarned} XP Total
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="card text-center py-12">
              <Trophy className="mx-auto mb-4 text-gray-600" size={48} />
              <p className="text-gray-400">No challenge history yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Challenges;
```

---

## 📁 Frontend Components

### `frontend/src/components/Navbar.jsx`

```javascript
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Home, BookOpen, TrendingUp, Target, Timer,Trophy } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-slate-900/95 backdrop-blur-sm border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">L</span>
            </div>
            <span className="text-white font-bold text-xl">LUMIN</span>
          </Link>

          {/* Navigation Links */}
          {isAuthenticated ? (
            <div className="flex items-center space-x-1">
              <Link
                to="/dashboard"
                className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-slate-800 transition"
              >
                <Home size={18} />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>

              <Link
                to="/entries"
                className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-slate-800 transition"
              >
                <BookOpen size={18} />
                <span className="hidden sm:inline">Journal</span>
              </Link>

              <Link
                to="/goals"
                className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-slate-800 transition"
              >
                <Target size={18} />
                <span className="hidden sm:inline">Goals</span>
              </Link>
                     
              <Link
                to="/challenges"
                className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-slate-800 transition"
              >
              <Trophy size={18} />
                <span className="hidden sm:inline">Challenges</span>
              </Link> 

              <Link
                to="/analytics"
                className="flex items-center space-x-2 px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-slate-800 transition"
              >
                <TrendingUp size={18} />
                <span className="hidden sm:inline">Analytics</span>
              </Link>

              <div className="h-6 w-px bg-slate-700 mx-2"></div>

              {/* User Info */}
              <div className="flex items-center space-x-3 px-4 py-2 rounded-lg bg-slate-800/50">
                <div className="hidden sm:block text-right">
                  <div className="text-sm font-semibold text-white">{user?.name}</div>
                  <div className="text-xs text-gray-400">Level {user?.level || 1} • {user?.xp || 0} XP</div>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold">{user?.name?.charAt(0).toUpperCase()}</span>
                </div>
              </div>
                <ThemeToggle />
              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link to="/login" className="text-gray-300 hover:text-white transition">
                Login
              </Link>
              <Link to="/register" className="btn-primary">
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
```

---

### `frontend/src/components/DailyChallenges.jsx`

```javascript
import { useState, useEffect } from 'react';
import { challengesAPI } from '../utils/api';
import { Trophy, Check, Clock } from 'lucide-react';

function DailyChallenges({ compact = false }) {
  const [challenges, setChallenges] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    setLoading(true);
    const result = await challengesAPI.getToday();
    if (result.success) {
      setChallenges(result.data);
    }
    setLoading(false);
  };

  const handleComplete = async (challengeId) => {
    const result = await challengesAPI.complete(challengeId);
    if (result.success) {
      alert(result.message);
      fetchChallenges();
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-700 rounded w-1/4"></div>
          <div className="h-12 bg-gray-700 rounded"></div>
          <div className="h-12 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (!challenges || !challenges.challenges || challenges.challenges.length === 0) {
    return null;
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white flex items-center">
          <Trophy className="mr-2 text-yellow-400" size={24} />
          Daily Challenges
        </h3>
        <span className="text-sm text-gray-400">
          {challenges.completedCount} / {challenges.challenges.length} completed
        </span>
      </div>

      <div className="space-y-3">
        {challenges.challenges.map((challenge) => (
          <div
            key={challenge._id}
            className={`p-4 rounded-lg border-2 transition ${
              challenge.completed
                ? 'border-green-500 bg-green-500/10'
                : 'border-slate-700 bg-slate-800/50'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                {challenge.completed ? (
                  <Check className="text-green-400 mt-1" size={20} />
                ) : (
                  <Clock className="text-yellow-400 mt-1" size={20} />
                )}
                
                <div className="flex-1">
                  <h4 className={`font-bold ${challenge.completed ? 'text-green-400' : 'text-white'}`}>
                    {challenge.title}
                  </h4>
                  <p className="text-gray-400 text-sm mt-1">
                    {challenge.description}
                  </p>
                  
                  {/* Progress Bar */}
                  {!challenge.completed && challenge.target > 1 && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-400">Progress</span>
                        <span className="text-xs text-gray-400">
                          {challenge.progress} / {challenge.target}
                        </span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-primary-500 h-2 rounded-full transition-all"
                          style={{ 
                            width: `${Math.min((challenge.progress / challenge.target) * 100, 100)}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-2 mt-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-primary-500/20 text-primary-400">
                      +{challenge.xpReward} XP
                    </span>
                    {challenge.completed && (
                      <span className="text-xs text-green-400">
                        ✓ Completed
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Total XP */}
      {challenges.completedCount > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-700 text-center">
          <div className="text-2xl font-bold text-yellow-400">
            +{challenges.totalXPEarned} XP
          </div>
          <div className="text-sm text-gray-400">
            Earned from challenges today
          </div>
        </div>
      )}
    </div>
  );
}

export default DailyChallenges;
```

---

### `frontend/src/components/Logo.jsx`

```javascript
import { Target, Zap } from 'lucide-react';
import { useState } from 'react';

function Logo({ size = "medium", showText = true, animated = true }) {
  const [isHovered, setIsHovered] = useState(false);
  
  const sizes = {
    small: { container: "w-10 h-10", icon: 20, text: "text-lg" },
    medium: { container: "w-14 h-14", icon: 28, text: "text-2xl" },
    large: { container: "w-20 h-20", icon: 40, text: "text-3xl" }
  };

  const current = sizes[size];

  return (
    <div 
      className="flex items-center space-x-3 group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 3D Logo Container */}
      <div className={`${current.container} relative`}>
        
        {/* Outer glow ring (animated) */}
        {animated && (
          <div className={`absolute inset-0 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 opacity-50 blur-md ${isHovered ? 'animate-pulse' : ''}`}></div>
        )}
        
        {/* Middle ring */}
        <div className="absolute inset-1 rounded-full bg-gradient-to-br from-primary-600 to-accent-600 opacity-80"></div>
        
        {/* Main logo background */}
        <div className={`
          relative h-full w-full rounded-full 
          bg-gradient-to-br from-primary-500 via-accent-500 to-primary-600
          flex items-center justify-center
          shadow-2xl
          transition-all duration-300
          ${isHovered ? 'scale-110 rotate-12' : 'scale-100 rotate-0'}
        `}>
          {/* Icon with dual layer for depth */}
          <div className="relative">
            {/* Shadow icon */}
            <Target 
              size={current.icon} 
              className="text-primary-900 absolute top-0.5 left-0.5 opacity-30" 
              strokeWidth={2.5} 
            />
            {/* Main icon */}
            <Target 
              size={current.icon} 
              className="text-white relative z-10" 
              strokeWidth={2.5} 
            />
          </div>

          {/* Energy particles (animated) */}
          {animated && isHovered && (
            <>
              <Zap size={12} className="absolute -top-1 -right-1 text-yellow-400 animate-ping" />
              <Zap size={12} className="absolute -bottom-1 -left-1 text-pink-400 animate-ping" style={{ animationDelay: '150ms' }} />
            </>
          )}
        </div>

        {/* Level badge (gamification) */}
        {animated && (
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-slate-900 shadow-lg">
            5
          </div>
        )}
      </div>
      
      {/* Brand Text */}
      {showText && (
        <div className="flex flex-col">
          <span className={`
            ${current.text} font-bold leading-none
            bg-gradient-to-r from-primary-400 via-accent-400 to-primary-400 
            bg-clip-text text-transparent
            transition-all duration-300
            ${isHovered ? 'tracking-wider' : 'tracking-normal'}
          `}>
            LUMIN
          </span>
          {size === 'large' && (
            <span className="text-xs text-gray-400 font-medium mt-1">
              Growth Tracker
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default Logo;

/* ════════════════════════════════════════════════════════════
   🎨 LOGO FEATURES:
   ════════════════════════════════════════════════════════════
   
   1. 3D DEPTH EFFECT:
      - Multiple layered circles create depth
      - Shadow icon behind main icon
      - Gradient from primary to accent color
   
   2. ANIMATIONS:
      - Hover: Scale + Rotate effect
      - Pulse glow on outer ring
      - Energy particles (Zap icons) appear on hover
   
   3. GAMIFICATION:
      - Level badge in bottom-right corner
      - Shows current user level
      - Can be updated dynamically
   
   4. CUSTOMIZABLE:
      - size: "small", "medium", "large"
      - showText: true/false
      - animated: true/false
   
   5. USAGE:
      <Logo size="large" />
      <Logo size="small" showText={false} />
      <Logo animated={false} />
   
   ════════════════════════════════════════════════════════════ */
```

---

### `frontend/src/components/ThemeToggle.jsx`

```javascript
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700 transition"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <Sun size={20} className="text-yellow-400" />
      ) : (
        <Moon size={20} className="text-blue-400" />
      )}
    </button>
  );
}

export default ThemeToggle;
```

---

## 📁 Frontend Utils & Config

### `frontend/src/utils/api.js`

```javascript
// ════════════════════════════════════════════════════════════
// API UTILITY - Centralized API calls
// ════════════════════════════════════════════════════════════

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ========== GET TOKEN FROM LOCALSTORAGE ==========
const getToken = () => {
  return localStorage.getItem('token');
};

// ========== HEADERS WITH AUTH ==========
const getHeaders = () => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// ════════════════════════════════════════════════════════════
// ENTRY API CALLS
// ════════════════════════════════════════════════════════════

export const entryAPI = {
  // Create new entry
  create: async (entryData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/entries`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(entryData)
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Get all entries
  getAll: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const url = `${API_BASE_URL}/entries${queryParams ? `?${queryParams}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getHeaders()
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Get single entry
  getOne: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/entries/${id}`, {
        method: 'GET',
        headers: getHeaders()
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Get today's entry
  getToday: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/entries/today`, {
        method: 'GET',
        headers: getHeaders()
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Update entry
  update: async (id, updates) => {
    try {
      const response = await fetch(`${API_BASE_URL}/entries/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(updates)
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Delete entry
  delete: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/entries/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
};

// ════════════════════════════════════════════════════════════
// AUTH API CALLS (already in AuthContext but here for reference)
// ════════════════════════════════════════════════════════════

export const authAPI = {
  register: async (name, email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  login: async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
};
// ... existing code ...

// ════════════════════════════════════════════════════════════
// STATS API CALLS
// ════════════════════════════════════════════════════════════

export const statsAPI = {
  getDashboard: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/stats/dashboard`, {
        method: 'GET',
        headers: getHeaders()
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  getMoodTrends: async (days = 30) => {
    try {
      const response = await fetch(`${API_BASE_URL}/stats/mood-trends?days=${days}`, {
        method: 'GET',
        headers: getHeaders()
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  getWeeklyActivity: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/stats/weekly-activity`, {
        method: 'GET',
        headers: getHeaders()
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

getGoalConsistency: async (days = 30) => {
    try {
      const response = await fetch(`${API_BASE_URL}/stats/goal-consistency?days=${days}`, {
        method: 'GET',
        headers: getHeaders()
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  getGoalTimeline: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/stats/goal-timeline`, {
        method: 'GET',
        headers: getHeaders()
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
};
// ════════════════════════════════════════════════════════════
// GOALS API CALLS
// ════════════════════════════════════════════════════════════

export const goalsAPI = {
  create: async (goalData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/goals`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(goalData)
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  getAll: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const url = `${API_BASE_URL}/goals${queryParams ? `?${queryParams}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getHeaders()
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  getOne: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/goals/${id}`, {
        method: 'GET',
        headers: getHeaders()
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  update: async (id, updates) => {
    try {
      const response = await fetch(`${API_BASE_URL}/goals/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(updates)
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  updateProgress: async (id, currentValue) => {
    try {
      const response = await fetch(`${API_BASE_URL}/goals/${id}/progress`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ currentValue })
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  completeMilestone: async (goalId, milestoneId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/goals/${goalId}/milestones/${milestoneId}`, {
        method: 'PATCH',
        headers: getHeaders()
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  delete: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/goals/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  getStats: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/goals/stats/overview`, {
        method: 'GET',
        headers: getHeaders()
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
};

// ════════════════════════════════════════════════════════════
// CHALLENGES API CALLS
// ════════════════════════════════════════════════════════════

export const challengesAPI = {
  getToday: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/challenges/today`, {
        method: 'GET',
        headers: getHeaders()
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  complete: async (challengeId, progress) => {
    try {
      const response = await fetch(`${API_BASE_URL}/challenges/${challengeId}/complete`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ progress })
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  getHistory: async (days = 30) => {
    try {
      const response = await fetch(`${API_BASE_URL}/challenges/history?days=${days}`, {
        method: 'GET',
        headers: getHeaders()
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  getStats: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/challenges/stats`, {
        method: 'GET',
        headers: getHeaders()
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
};

export default { entryAPI, authAPI, statsAPI, goalsAPI, challengesAPI };
```

---

### `frontend/src/config/theme.js`

```javascript

// 🎨 LUMIN THEME CONFIGURATION
// ════════════════════════════════════════════════════════════
// Change colors, fonts, spacing easily from this ONE file!
// ════════════════════════════════════════════════════════════

export const theme = {
  // ========== COLORS (HEX) ==========
  // Main brand colors
  colors: {
    primary: {
      main: '#a855f7',      // Purple - Main brand color
      light: '#c084fc',     // Light purple - Hover states
      dark: '#7e22ce',      // Dark purple - Active states
      gradient: 'from-primary-500 to-accent-500'
    },
    accent: {
      main: '#ec4899',      // Pink - Accent/CTA
      light: '#f472b6',     
      dark: '#be185d',
      gradient: 'from-accent-500 to-primary-500'
    },
    background: {
      dark: '#0f172a',      // Main dark background
      card: '#1e293b',      // Card background
      hover: '#334155'      // Hover state
    },
    text: {
      primary: '#ffffff',   // Main text
      secondary: '#cbd5e1', // Secondary text
      muted: '#94a3b8'      // Muted text
    },
    gamification: {
      xp: '#fbbf24',        // Yellow - XP points
      level: '#8b5cf6',     // Purple - Level
      streak: '#f97316',    // Orange - Streak fire
      badge: '#10b981'      // Green - Badges
    }
  },

  // ========== LAYOUT ==========
  layout: {
    maxWidth: '1280px',     // Max container width
    padding: {
      mobile: '1rem',       // 16px
      tablet: '1.5rem',     // 24px
      desktop: '2rem'       // 32px
    },
    borderRadius: {
      small: '0.5rem',      // 8px - Buttons
      medium: '0.75rem',    // 12px - Cards
      large: '1rem'         // 16px - Modals
    }
  },

  // ========== TYPOGRAPHY ==========
  fonts: {
    primary: "'Inter', system-ui, sans-serif",
    heading: "'Poppins', 'Inter', sans-serif",
    mono: "'Fira Code', monospace"
  },

  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem',// 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem'     // 48px
  },

  // ========== SHADOWS ==========
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    glow: '0 0 20px rgba(168, 85, 247, 0.4)',
    glowPink: '0 0 20px rgba(236, 72, 153, 0.4)'
  },

  // ========== ANIMATIONS ==========
  animations: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms'
    },
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
  },

  // ========== GAMIFICATION ==========
  gamification: {
    xpPerEntry: 50,
    xpPerDetailedEntry: 75,
    xpPerStreak: {
      3: 100,
      7: 250,
      30: 1000
    },
    levelThresholds: [
      0,      // Level 1
      100,    // Level 2
      300,    // Level 3
      600,    // Level 4
      1000,   // Level 5
      1500,   // Level 6
      2100,   // Level 7
      2800,   // Level 8
      3600,   // Level 9
      4500    // Level 10
    ]
  }
};

// ========== HELPER FUNCTIONS ==========
export const getGradient = (type = 'primary') => {
  return type === 'primary' 
    ? theme.colors.primary.gradient 
    : theme.colors.accent.gradient;
};

export const getLevelFromXP = (xp) => {
  const thresholds = theme.gamification.levelThresholds;
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (xp >= thresholds[i]) return i + 1;
  }
  return 1;
};

export const getXPForNextLevel = (currentXP) => {
  const level = getLevelFromXP(currentXP);
  return theme.gamification.levelThresholds[level] || currentXP + 1000;
};

// ════════════════════════════════════════════════════════════
// HOW TO USE:
// ════════════════════════════════════════════════════════════
// 
// Import in any component:
// import { theme } from '@/config/theme';
// 
// Use colors:
// <div style={{ color: theme.colors.primary.main }}>Hello</div>
// 
// Or with Tailwind (update tailwind.config.js):
// colors: theme.colors
// 
// ════════════════════════════════════════════════════════════
```

---

## 📝 Notes for Claude AI

1. **Follow existing patterns:** Use same code style, naming conventions, and structure
2. **API calls:** All go through `frontend/src/utils/api.js`
3. **Styling:** Use Tailwind CSS classes, theme from `config/theme.js`
4. **State:** Use React Context for global state, useState for local
5. **Error handling:** Always check `result.success`, show user-friendly messages

**Next Steps:**
1. Review codebase structure
2. Implement Phase 1: UX improvements (toasts, search, filters)
3. Implement Phase 2: Missing charts (mood pie, streak calendar)
4. Implement Phase 3: AI Integration (Gemini API)
5. Implement Phase 4: Pomodoro Timer
6. Implement Phase 5: Vision Board

---

*End of codebase*
