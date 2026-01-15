const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getProfile,
  updateProfile,
  updateSettings,
  changePassword,
  getStats
} = require('../controllers/profileController');

// All routes are protected
router.use(protect);

// GET /api/profile - Get user profile
router.get('/', getProfile);

// PUT /api/profile - Update profile
router.put('/', updateProfile);

// PUT /api/profile/settings - Update settings
router.put('/settings', updateSettings);

// PUT /api/profile/password - Change password
router.put('/password', changePassword);

// GET /api/profile/stats - Get user stats
router.get('/stats', getStats);

module.exports = router;