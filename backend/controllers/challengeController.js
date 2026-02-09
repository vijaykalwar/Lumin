const Challenge = require('../models/Challenge');
const User = require('../models/User');
const { generateDailyChallenges, updateChallengeProgress } = require('../services/challengeService');
const { calculateLevel } = require('../utils/gamification');

// ════════════════════════════════════════════════════════════
// @desc    Get today's challenges
// @route   GET /api/challenges/today
// @access  Private
// ════════════════════════════════════════════════════════════
exports.getTodayChallenges = async (req, res) => {
  try {
    // Generate or get today's challenges
    const challenges = await generateDailyChallenges(req.user._id);

    res.status(200).json({
      success: true,
      data: challenges
    });

  } catch (error) {
    console.error('Get Today Challenges Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch challenges',
      error: error.message
    });
  }
};

// ════════════════════════════════════════════════════════════
// @desc    Complete a challenge
// @route   PATCH /api/challenges/:challengeId/complete
// @access  Private
// ════════════════════════════════════════════════════════════
exports.completeChallenge = async (req, res) => {
  try {
    const { challengeId } = req.params;
    const { progress } = req.body;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dailyChallenge = await Challenge.findOne({
      user: req.user._id,
      date: today
    });

    if (!dailyChallenge) {
      return res.status(404).json({
        success: false,
        message: 'No challenges found for today'
      });
    }

    // Find the specific challenge (needs to be Mongoose document to modify)
    const challenge = dailyChallenge.challenges.id(challengeId);

    if (!challenge) {
      return res.status(404).json({
        success: false,
        message: 'Challenge not found'
      });
    }

    if (challenge.completed) {
      return res.status(400).json({
        success: false,
        message: 'Challenge already completed'
      });
    }

    // Mark as completed
    challenge.progress = progress || challenge.target;
    challenge.completed = true;
    challenge.completedAt = new Date();

    await dailyChallenge.checkCompletion();

    // Award XP
    const user = await User.findById(req.user._id);
    user.xp += challenge.xpReward;
    user.level = calculateLevel(user.xp);
    await user.save();

    res.status(200).json({
      success: true,
      message: `Challenge completed! +${challenge.xpReward} XP 🎉`,
      data: {
        challenge: dailyChallenge,
        xpEarned: challenge.xpReward,
        newLevel: user.level
      }
    });

  } catch (error) {
    console.error('Complete Challenge Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete challenge',
      error: error.message
    });
  }
};

// ════════════════════════════════════════════════════════════
// @desc    Get challenge history
// @route   GET /api/challenges/history
// @access  Private
// ════════════════════════════════════════════════════════════
exports.getChallengeHistory = async (req, res) => {
  try {
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    startDate.setHours(0, 0, 0, 0);

    const history = await Challenge.find({
      user: req.user._id,
      date: { $gte: startDate }
    })
    .sort({ date: -1 })
    .select('-__v')
    .lean();

    // Calculate statistics
    const stats = {
      totalDays: history.length,
      totalChallenges: history.reduce((sum, day) => sum + day.challenges.length, 0),
      completedChallenges: history.reduce((sum, day) => sum + day.completedCount, 0),
      totalXPEarned: history.reduce((sum, day) => sum + day.totalXPEarned, 0),
      perfectDays: history.filter(day => day.completedCount === 3).length
    };

    stats.completionRate = stats.totalChallenges > 0 
      ? Math.round((stats.completedChallenges / stats.totalChallenges) * 100)
      : 0;

    res.status(200).json({
      success: true,
      data: {
        history,
        stats
      }
    });

  } catch (error) {
    console.error('Get Challenge History Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch challenge history',
      error: error.message
    });
  }
};

// ════════════════════════════════════════════════════════════
// @desc    Get challenge statistics
// @route   GET /api/challenges/stats
// @access  Private
// ════════════════════════════════════════════════════════════
exports.getChallengeStats = async (req, res) => {
  try {
    const allChallenges = await Challenge.find({ user: req.user._id });

    // Calculate stats by challenge type
    const typeStats = {};
    const challengeTypes = [
      'word-count', 'early-bird', 'night-owl', 'tag-master',
      'streak-keeper', 'mood-variety', 'detailed-entry', 'grateful', 'reflection'
    ];

    challengeTypes.forEach(type => {
      const typeChallenges = allChallenges.flatMap(day => 
        day.challenges.filter(c => c.type === type)
      );

      typeStats[type] = {
        total: typeChallenges.length,
        completed: typeChallenges.filter(c => c.completed).length,
        completionRate: typeChallenges.length > 0
          ? Math.round((typeChallenges.filter(c => c.completed).length / typeChallenges.length) * 100)
          : 0
      };
    });

    res.status(200).json({
      success: true,
      data: typeStats
    });

  } catch (error) {
    console.error('Get Challenge Stats Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch challenge stats',
      error: error.message
    });
  }
};