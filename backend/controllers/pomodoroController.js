const PomodoroSession = require('../models/PomodoroSession');
const User = require('../models/User');
const { calculateLevel } = require('../utils/gamification');

// ════════════════════════════════════════════════════════════
// @desc    Start new Pomodoro session
// @route   POST /api/pomodoro/start
// @access  Private
// ════════════════════════════════════════════════════════════
exports.startSession = async (req, res) => {
  try {
    const { type, duration, task, linkedGoal } = req.body;

    // Get today's sessions to determine session number
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaySessions = await PomodoroSession.countDocuments({
      user: req.user._id,
      type: 'focus',
      createdAt: { $gte: today }
    });

    const session = await PomodoroSession.create({
      user: req.user._id,
      type: type || 'focus',
      duration: duration || 25,
      task: task || '',
      linkedGoal: linkedGoal || null,
      sessionNumber: todaySessions + 1
    });

    res.status(201).json({
      success: true,
      message: 'Session started!',
      data: session
    });
  } catch (error) {
    console.error('Start Session Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start session',
      error: error.message
    });
  }
};

// ════════════════════════════════════════════════════════════
// @desc    Complete Pomodoro session
// @route   PATCH /api/pomodoro/:id/complete
// @access  Private
// ════════════════════════════════════════════════════════════
exports.completeSession = async (req, res) => {
  try {
    const { notes } = req.body;

    let session = await PomodoroSession.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    if (session.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    if (session.completed) {
      return res.status(400).json({
        success: false,
        message: 'Session already completed'
      });
    }

    // Complete session and get XP
    await session.completeSession();
    if (notes) session.notes = notes;
    await session.save();

    // Award XP to user
    const user = await User.findById(req.user._id);
    user.xp += session.xpAwarded;
    user.level = calculateLevel(user.xp);
    await user.save();

    res.status(200).json({
      success: true,
      message: `Session completed! +${session.xpAwarded} XP`,
      data: {
        session,
        xpEarned: session.xpAwarded,
        newLevel: user.level,
        totalXP: user.xp
      }
    });
  } catch (error) {
    console.error('Complete Session Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete session',
      error: error.message
    });
  }
};

// ════════════════════════════════════════════════════════════
// @desc    Get all sessions
// @route   GET /api/pomodoro
// @access  Private
// ════════════════════════════════════════════════════════════
exports.getSessions = async (req, res) => {
  try {
    const { limit = 20, page = 1 } = req.query;

    // ✅ OPTIMIZED: Run queries in parallel
    const [sessions, total] = await Promise.all([
      PomodoroSession.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit))
        .lean(),
      PomodoroSession.countDocuments({ user: req.user._id })
    ]);

    res.status(200).json({
      success: true,
      data: {
        sessions,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalSessions: total
        }
      }
    });
  } catch (error) {
    console.error('Get Sessions Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch sessions',
      error: error.message
    });
  }
};

// ════════════════════════════════════════════════════════════
// @desc    Get today's sessions
// @route   GET /api/pomodoro/today
// @access  Private
// ════════════════════════════════════════════════════════════
exports.getTodaySessions = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sessions = await PomodoroSession.find({
      user: req.user._id,
      createdAt: { $gte: today }
    })
    .sort({ createdAt: -1 })
    .lean();

    // Calculate stats
    const stats = {
      totalSessions: sessions.length,
      focusSessions: sessions.filter(s => s.type === 'focus').length,
      completedSessions: sessions.filter(s => s.completed).length,
      totalFocusTime: sessions
        .filter(s => s.type === 'focus' && s.completed)
        .reduce((sum, s) => sum + s.duration, 0),
      totalXP: sessions
        .filter(s => s.completed)
        .reduce((sum, s) => sum + s.xpAwarded, 0)
    };

    res.status(200).json({
      success: true,
      data: {
        sessions,
        stats
      }
    });
  } catch (error) {
    console.error('Get Today Sessions Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch today\'s sessions',
      error: error.message
    });
  }
};

// ════════════════════════════════════════════════════════════
// @desc    Get Pomodoro statistics
// @route   GET /api/pomodoro/stats
// @access  Private
// ════════════════════════════════════════════════════════════
exports.getStats = async (req, res) => {
  try {
    const { days = 7 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    startDate.setHours(0, 0, 0, 0);

    const sessions = await PomodoroSession.find({
      user: req.user._id,
      createdAt: { $gte: startDate }
    }).lean();

    // Calculate detailed stats
    const stats = {
      totalSessions: sessions.length,
      completedSessions: sessions.filter(s => s.completed).length,
      focusSessions: sessions.filter(s => s.type === 'focus').length,
      totalFocusTime: sessions
        .filter(s => s.type === 'focus' && s.completed)
        .reduce((sum, s) => sum + s.duration, 0),
      totalXP: sessions
        .filter(s => s.completed)
        .reduce((sum, s) => sum + s.xpAwarded, 0),
      completionRate: sessions.length > 0 
        ? Math.round((sessions.filter(s => s.completed).length / sessions.length) * 100)
        : 0,
      averageSessionsPerDay: Math.round(sessions.length / parseInt(days))
    };

    // Daily breakdown
    const dailyBreakdown = {};
    sessions.forEach(session => {
      const date = new Date(session.createdAt).toLocaleDateString();
      if (!dailyBreakdown[date]) {
        dailyBreakdown[date] = {
          sessions: 0,
          focusTime: 0,
          xp: 0
        };
      }
      dailyBreakdown[date].sessions++;
      if (session.type === 'focus' && session.completed) {
        dailyBreakdown[date].focusTime += session.duration;
      }
      if (session.completed) {
        dailyBreakdown[date].xp += session.xpAwarded;
      }
    });

    res.status(200).json({
      success: true,
      data: {
        stats,
        dailyBreakdown
      }
    });
  } catch (error) {
    console.error('Get Stats Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch statistics',
      error: error.message
    });
  }
};

// ════════════════════════════════════════════════════════════
// @desc    Delete session
// @route   DELETE /api/pomodoro/:id
// @access  Private
// ════════════════════════════════════════════════════════════
exports.deleteSession = async (req, res) => {
  try {
    const session = await PomodoroSession.findById(req.params.id);

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    if (session.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    await session.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Session deleted'
    });
  } catch (error) {
    console.error('Delete Session Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete session',
      error: error.message
    });
  }
};

module.exports = exports;