const Entry = require('../models/Entry');
const User = require('../models/User');

// ════════════════════════════════════════════════════════════
// @desc    Get user dashboard stats
// @route   GET /api/stats/dashboard
// @access  Private
// ════════════════════════════════════════════════════════════
exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // ========== GET USER DATA ==========
    const user = await User.findById(userId).select('-password');

    // ========== COUNT ENTRIES ==========
    const totalEntries = await Entry.countDocuments({ user: userId });

    // ========== GET RECENT ENTRIES ==========
    const recentEntries = await Entry.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('mood moodEmoji title notes xpAwarded createdAt');

    // ========== GET THIS WEEK'S ENTRIES ==========
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    
    const weekEntries = await Entry.countDocuments({
      user: userId,
      createdAt: { $gte: weekStart }
    });

    // ========== GET MOOD DISTRIBUTION ==========
    const moodDistribution = await Entry.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$mood', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // ========== CALCULATE NEXT LEVEL XP ==========
    const currentLevel = user.level;
    const currentXP = user.xp;
    const xpForCurrentLevel = (currentLevel - 1) * 150;
    const xpForNextLevel = currentLevel * 150;
    const xpProgress = ((currentXP - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100;

    // ========== RESPONSE ==========
    res.status(200).json({
      success: true,
      data: {
        user: {
          name: user.name,
          email: user.email,
          xp: user.xp,
          level: user.level,
          streak: user.streak,
          badges: user.badges
        },
        stats: {
          totalEntries,
          weekEntries,
          longestStreak: user.streak, // TODO: Track separately
          totalXP: user.xp
        },
        progress: {
          xpProgress: Math.round(xpProgress),
          xpForNextLevel: xpForNextLevel - currentXP,
          currentLevelXP: currentXP - xpForCurrentLevel,
          nextLevelXP: xpForNextLevel - xpForCurrentLevel
        },
        recentEntries,
        moodDistribution: moodDistribution.map(m => ({
          mood: m._id,
          count: m.count
        }))
      }
    });

  } catch (error) {
    console.error('Get Dashboard Stats Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch dashboard stats',
      error: error.message
    });
  }
};

// ════════════════════════════════════════════════════════════
// @desc    Get mood analytics
// @route   GET /api/stats/mood-trends
// @access  Private
// ════════════════════════════════════════════════════════════
exports.getMoodTrends = async (req, res) => {
  try {
    const userId = req.user._id;
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // ========== GET DAILY MOOD DATA ==========
    const moodTrends = await Entry.aggregate([
      {
        $match: {
          user: userId,
          entryDate: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$entryDate' } },
            mood: '$mood'
          },
          count: { $sum: 1 },
          avgIntensity: { $avg: '$moodIntensity' }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: moodTrends
    });

  } catch (error) {
    console.error('Get Mood Trends Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch mood trends',
      error: error.message
    });
  }
};

// ════════════════════════════════════════════════════════════
// @desc    Get weekly activity
// @route   GET /api/stats/weekly-activity
// @access  Private
// ════════════════════════════════════════════════════════════
exports.getWeeklyActivity = async (req, res) => {
  try {
    const userId = req.user._id;

    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);

    // ========== GET ENTRIES PER DAY ==========
    const weeklyActivity = await Entry.aggregate([
      {
        $match: {
          user: userId,
          entryDate: { $gte: weekStart }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$entryDate' } },
          entries: { $sum: 1 },
          totalXP: { $sum: '$xpAwarded' },
          moods: { $push: '$mood' }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: weeklyActivity
    });

  } catch (error) {
    console.error('Get Weekly Activity Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch weekly activity',
      error: error.message
    });
  }
};

// Add after existing functions

// ════════════════════════════════════════════════════════════
// @desc    Get goal consistency analytics
// @route   GET /api/stats/goal-consistency
// @access  Private
// ════════════════════════════════════════════════════════════
exports.getGoalConsistency = async (req, res) => {
  try {
    const userId = req.user._id;
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const Goal = require('../models/Goal');
    const Entry = require('../models/Entry');

    // Get active goals
    const goals = await Goal.find({ 
      user: userId,
      status: 'active'
    });

    // Get daily entries for consistency
    const entries = await Entry.aggregate([
      {
        $match: {
          user: userId,
          entryDate: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$entryDate' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Calculate consistency score
    const totalDays = parseInt(days);
    const activeDays = entries.length;
    const consistencyScore = Math.round((activeDays / totalDays) * 100);

    // Goal completion rate
    const allGoals = await Goal.find({ user: userId });
    const completedGoals = allGoals.filter(g => g.status === 'completed').length;
    const goalCompletionRate = allGoals.length > 0 
      ? Math.round((completedGoals / allGoals.length) * 100)
      : 0;

    // Daily goal efforts
    const dailyEfforts = await Entry.aggregate([
      {
        $match: {
          user: userId,
          entryDate: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$entryDate' } },
          entries: { $sum: 1 },
          totalWords: { $sum: '$wordCount' },
          totalXP: { $sum: '$xpAwarded' }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Average daily effort
    const avgDailyWords = dailyEfforts.length > 0
      ? Math.round(dailyEfforts.reduce((sum, day) => sum + day.totalWords, 0) / dailyEfforts.length)
      : 0;

    const avgDailyXP = dailyEfforts.length > 0
      ? Math.round(dailyEfforts.reduce((sum, day) => sum + day.totalXP, 0) / dailyEfforts.length)
      : 0;

    // Streak data
    const user = await require('../models/User').findById(userId);

    res.status(200).json({
      success: true,
      data: {
        consistencyScore,
        activeDays,
        totalDays,
        currentStreak: user.streak,
        goals: {
          active: goals.length,
          total: allGoals.length,
          completed: completedGoals,
          completionRate: goalCompletionRate
        },
        dailyEfforts,
        averages: {
          words: avgDailyWords,
          xp: avgDailyXP
        }
      }
    });

  } catch (error) {
    console.error('Get Goal Consistency Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch goal consistency',
      error: error.message
    });
  }
};

// ════════════════════════════════════════════════════════════
// @desc    Get goal progress timeline
// @route   GET /api/stats/goal-timeline
// @access  Private
// ════════════════════════════════════════════════════════════
exports.getGoalTimeline = async (req, res) => {
  try {
    const userId = req.user._id;
    const Goal = require('../models/Goal');

    const goals = await Goal.find({ user: userId })
      .sort({ createdAt: -1 })
      .select('title category status progressPercentage targetDate createdAt completedAt');

    // Group by month
    const timeline = {};
    
    goals.forEach(goal => {
      const month = new Date(goal.createdAt).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      });
      
      if (!timeline[month]) {
        timeline[month] = {
          created: 0,
          completed: 0,
          active: 0
        };
      }
      
      timeline[month].created++;
      if (goal.status === 'completed') timeline[month].completed++;
      if (goal.status === 'active') timeline[month].active++;
    });

    res.status(200).json({
      success: true,
      data: {
        goals,
        timeline
      }
    });

  } catch (error) {
    console.error('Get Goal Timeline Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch goal timeline',
      error: error.message
    });
  }
};