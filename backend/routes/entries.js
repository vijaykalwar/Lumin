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