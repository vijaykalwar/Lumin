const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  exportEntriesJSON,
  exportEntriesCSV,
  exportGoalsJSON,
  exportGoalsCSV,
  exportAllData
} = require('../controllers/exportController');

// All routes require authentication
router.use(protect);

// ════════════════════════════════════════════════════════════
// ENTRIES EXPORT
// ════════════════════════════════════════════════════════════
// GET /api/export/entries/json
router.get('/entries/json', exportEntriesJSON);

// GET /api/export/entries/csv
router.get('/entries/csv', exportEntriesCSV);

// ════════════════════════════════════════════════════════════
// GOALS EXPORT
// ════════════════════════════════════════════════════════════
// GET /api/export/goals/json
router.get('/goals/json', exportGoalsJSON);

// GET /api/export/goals/csv
router.get('/goals/csv', exportGoalsCSV);

// ════════════════════════════════════════════════════════════
// ALL DATA EXPORT
// ════════════════════════════════════════════════════════════
// GET /api/export/all
router.get('/all', exportAllData);

module.exports = router;
