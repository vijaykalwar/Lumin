const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  startSession,
  completeSession,
  getSessions,
  getTodaySessions,
  getStats,
  deleteSession
} = require('../controllers/pomodoroController');

// ════════════════════════════════════════════════════════════
// ALL ROUTES REQUIRE AUTHENTICATION
// ════════════════════════════════════════════════════════════

// Start session
router.post('/start', protect, startSession);

// Complete session
router.patch('/:id/complete', protect, completeSession);

// Get all sessions
router.get('/', protect, getSessions);

// Get today's sessions
router.get('/today', protect, getTodaySessions);

// Get statistics
router.get('/stats', protect, getStats);

// Delete session
router.delete('/:id', protect, deleteSession);

module.exports = router;