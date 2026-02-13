const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { cacheMiddleware } = require('../utils/cache');
const {
  getDashboardStats,
  getMoodTrends,
  getWeeklyActivity,
  getGoalConsistency,
  getGoalTimeline
} = require('../controllers/statsController');

// Dashboard & stats with 5-min cache for fast loads
router.get('/dashboard', protect, cacheMiddleware(300), getDashboardStats);
router.get('/weekly-activity', protect, cacheMiddleware(300), getWeeklyActivity);
router.get('/mood-trends', protect, cacheMiddleware(600), getMoodTrends);
router.get('/goal-consistency', protect, cacheMiddleware(600), getGoalConsistency);
router.get('/goal-timeline', protect, cacheMiddleware(600), getGoalTimeline);

module.exports = router;