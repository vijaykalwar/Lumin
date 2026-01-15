const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createTeam,
  getMyTeams,
  getTeam,
  joinTeam,
  leaveTeam,
  getTeamFeed,
  getLeaderboard,
  deleteTeam
} = require('../controllers/teamController');

// ════════════════════════════════════════════════════════════
// ALL ROUTES REQUIRE AUTHENTICATION
// ════════════════════════════════════════════════════════════

// Create team
router.post('/', protect, createTeam);

// Get my teams
router.get('/my-teams', protect, getMyTeams);

// Join team
router.post('/join', protect, joinTeam);

// Get single team
router.get('/:id', protect, getTeam);

// Leave team
router.post('/:id/leave', protect, leaveTeam);

// Get team feed
router.get('/:id/feed', protect, getTeamFeed);

// Get leaderboard
router.get('/:id/leaderboard', protect, getLeaderboard);

// Delete team
router.delete('/:id', protect, deleteTeam);

module.exports = router;