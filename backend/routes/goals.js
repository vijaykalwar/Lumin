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