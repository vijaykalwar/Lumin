const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getPrompts,
  analyzeMood,
  planGoal,
  suggestHabits,
  getMotivation,
  chat
} = require('../controllers/aiController');

// All routes are protected (require authentication)
router.use(protect);

// GET /api/ai/prompts - Get predefined prompts
router.get('/prompts', getPrompts);

// POST /api/ai/analyze-mood - Analyze user's mood patterns
router.post('/analyze-mood', analyzeMood);

// POST /api/ai/plan-goal - Get AI help for goal planning
router.post('/plan-goal', planGoal);

// POST /api/ai/suggest-habits - Get habit suggestions
router.post('/suggest-habits', suggestHabits);

// POST /api/ai/motivate - Get personalized motivation
router.post('/motivate', getMotivation);

// POST /api/ai/chat - General AI conversation
router.post('/chat', chat);

module.exports = router;