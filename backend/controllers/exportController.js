const Entry = require('../models/Entry');
const Goal = require('../models/Goal');

// ════════════════════════════════════════════════════════════
// @desc    Export entries as JSON
// @route   GET /api/export/entries/json
// @access  Private
// ════════════════════════════════════════════════════════════
exports.exportEntriesJSON = async (req, res) => {
  try {
    const entries = await Entry.find({ user: req.user._id })
      .sort({ entryDate: -1 })
      .select('-__v -user')
      .lean();

    res.status(200).json({
      success: true,
      exportDate: new Date().toISOString(),
      count: entries.length,
      data: entries
    });

  } catch (error) {
    console.error('Export Entries JSON Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export entries',
      error: error.message
    });
  }
};

// ════════════════════════════════════════════════════════════
// @desc    Export entries as CSV
// @route   GET /api/export/entries/csv
// @access  Private
// ════════════════════════════════════════════════════════════
exports.exportEntriesCSV = async (req, res) => {
  try {
    const entries = await Entry.find({ user: req.user._id })
      .sort({ entryDate: -1 })
      .lean();

    if (entries.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No entries found to export'
      });
    }

    // CSV Headers
    const headers = [
      'Date',
      'Title',
      'Mood',
      'Category',
      'Notes',
      'Tags',
      'Word Count',
      'Created At'
    ];

    // CSV Rows
    const rows = entries.map(entry => [
      entry.entryDate ? new Date(entry.entryDate).toLocaleDateString() : '',
      entry.title || '',
      entry.mood || '',
      entry.category || '',
      (entry.notes || '').replace(/"/g, '""'), // Escape quotes
      (entry.tags || []).join('; '),
      entry.wordCount || 0,
      new Date(entry.createdAt).toLocaleString()
    ]);

    // Build CSV
    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Set headers for download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="lumin-entries-${Date.now()}.csv"`);
    res.status(200).send(csv);

  } catch (error) {
    console.error('Export Entries CSV Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export entries',
      error: error.message
    });
  }
};

// ════════════════════════════════════════════════════════════
// @desc    Export goals as JSON
// @route   GET /api/export/goals/json
// @access  Private
// ════════════════════════════════════════════════════════════
exports.exportGoalsJSON = async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .select('-__v -user')
      .lean();

    res.status(200).json({
      success: true,
      exportDate: new Date().toISOString(),
      count: goals.length,
      data: goals
    });

  } catch (error) {
    console.error('Export Goals JSON Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export goals',
      error: error.message
    });
  }
};

// ════════════════════════════════════════════════════════════
// @desc    Export goals as CSV
// @route   GET /api/export/goals/csv
// @access  Private
// ════════════════════════════════════════════════════════════
exports.exportGoalsCSV = async (req, res) => {
  try {
    const goals = await Goal.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .lean();

    if (goals.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No goals found to export'
      });
    }

    // CSV Headers
    const headers = [
      'Title',
      'Description',
      'Category',
      'Priority',
      'Status',
      'Current Value',
      'Target Value',
      'Unit',
      'Progress %',
      'Target Date',
      'Completed At',
      'Created At'
    ];

    // CSV Rows
    const rows = goals.map(goal => {
      const progress = goal.targetValue > 0 
        ? Math.round((goal.currentValue / goal.targetValue) * 100)
        : 0;

      return [
        goal.title || '',
        (goal.description || '').replace(/"/g, '""'),
        goal.category || '',
        goal.priority || '',
        goal.status || '',
        goal.currentValue || 0,
        goal.targetValue || 0,
        goal.unit || '',
        progress,
        goal.targetDate ? new Date(goal.targetDate).toLocaleDateString() : '',
        goal.completedAt ? new Date(goal.completedAt).toLocaleDateString() : '',
        new Date(goal.createdAt).toLocaleString()
      ];
    });

    // Build CSV
    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Set headers for download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="lumin-goals-${Date.now()}.csv"`);
    res.status(200).send(csv);

  } catch (error) {
    console.error('Export Goals CSV Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export goals',
      error: error.message
    });
  }
};

// ════════════════════════════════════════════════════════════
// @desc    Export all user data (entries + goals)
// @route   GET /api/export/all
// @access  Private
// ════════════════════════════════════════════════════════════
exports.exportAllData = async (req, res) => {
  try {
    const [entries, goals] = await Promise.all([
      Entry.find({ user: req.user._id }).sort({ entryDate: -1 }).select('-__v -user').lean(),
      Goal.find({ user: req.user._id }).sort({ createdAt: -1 }).select('-__v -user').lean()
    ]);

    res.status(200).json({
      success: true,
      exportDate: new Date().toISOString(),
      user: {
        name: req.user.name,
        email: req.user.email,
        xp: req.user.xp,
        level: req.user.level,
        streak: req.user.streak
      },
      data: {
        entries: {
          count: entries.length,
          data: entries
        },
        goals: {
          count: goals.length,
          data: goals
        }
      }
    });

  } catch (error) {
    console.error('Export All Data Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export data',
      error: error.message
    });
  }
};
