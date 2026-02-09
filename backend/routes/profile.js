const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middleware/authMiddleware');
const {
  getProfile,
  updateProfile,
  updateSettings,
  changePassword,
  getStats,
  uploadAvatar
} = require('../controllers/profileController');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// All routes are protected
router.use(protect);

// GET /api/profile - Get user profile
router.get('/', getProfile);

// PUT /api/profile - Update profile
router.put('/', updateProfile);

// POST /api/profile/avatar - Upload avatar
router.post('/avatar', upload.single('avatar'), uploadAvatar);

// PUT /api/profile/settings - Update settings
router.put('/settings', updateSettings);

// PUT /api/profile/password - Change password
router.put('/password', changePassword);

// GET /api/profile/stats - Get user stats
router.get('/stats', getStats);

module.exports = router;