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