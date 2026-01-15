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