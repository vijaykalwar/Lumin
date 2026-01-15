const Entry = require('../models/Entry');
const User = require('../models/User');
const { 
  calculateXP, 
  calculateLevel, 
  updateStreak, 
  checkBadges, 
  checkLevelUp 
} = require('../utils/gamification');
const { updateChallengeProgress } = require('../services/challengeService');

// ════════════════════════════════════════════════════════════
// @desc    Create new journal entry
// @route   POST /api/entries
// @access  Private
// ════════════════════════════════════════════════════════════
exports.createEntry = async (req, res) => {
  try {
    const { 
      mood, 
      moodEmoji, 
      moodIntensity, 
      title, 
      notes, 
      tags, 
      isPrivate, 
      entryDate,
      category,
      location 
    } = req.body;

    // ========== VALIDATION ==========
    if (!mood || !notes) {
      return res.status(400).json({
        success: false,
        message: 'Mood and notes are required'
      });
    }

    if (notes.length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Entry must be at least 10 characters long'
      });
    }

    // ========== CHECK TODAY'S ENTRY ==========
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existingEntry = await Entry.findOne({
      user: req.user._id,
      entryDate: { $gte: today }
    });

    if (existingEntry) {
      return res.status(400).json({
        success: false,
        message: 'You have already created an entry today. You can edit it instead.',
        data: {
          hasEntryToday: true,
          existingEntry: existingEntry._id
        }
      });
    }

    // ========== CREATE ENTRY ==========
    const entry = await Entry.create({
      user: req.user._id,
      mood: mood.toLowerCase(),
      moodEmoji: moodEmoji || getMoodEmoji(mood),
      moodIntensity: moodIntensity || 5,
      title: title || '',
      notes,
      tags: tags || [],
      category: category || 'personal',
      location: location || null,
      isPrivate: isPrivate !== undefined ? isPrivate : true,
      entryDate: entryDate || Date.now()
    });

    // ========== GET USER & SAVE OLD XP ==========
    const user = await User.findById(req.user._id);
    const oldXP = user.xp;
    const oldLevel = user.level;

    // ========== CALCULATE XP (Using advanced function) ==========
    const xpResult = calculateXP(entry);
    entry.xpAwarded = xpResult.total;
    await entry.save();

    // Award XP to user
    user.xp += xpResult.total;

    // ========== UPDATE STREAK (Using function) ==========
    const streakResult = await updateStreak(user._id);
    
    if (streakResult.streakChanged) {
      user.streak = streakResult.currentStreak;
    }
    
    // Award streak milestone bonus
    if (streakResult.bonusXP) {
      user.xp += streakResult.bonusXP;
    }

    // Update last entry date
    user.lastEntryDate = new Date();

    // ========== CALCULATE NEW LEVEL ==========
    user.level = calculateLevel(user.xp);
    const leveledUp = user.level > oldLevel;

    // ========== CHECK BADGES (Using function) ==========
    const newBadges = await checkBadges(user);

    // ========== AUTO-CHECK CHALLENGES ==========
    const updatedChallenges = await updateChallengeProgress(req.user._id, entry);
    
    let challengeXP = 0;
    let challengesCompleted = 0;
    
    if (updatedChallenges && updatedChallenges.totalXPEarned > 0) {
      challengeXP = updatedChallenges.totalXPEarned;
      user.xp += challengeXP;
      user.level = calculateLevel(user.xp);
      challengesCompleted = updatedChallenges.completedCount || 0;
    }

    // ========== SAVE USER ==========
    await user.save();

    // ========== RESPONSE WITH DETAILED REWARDS ==========
    res.status(201).json({
      success: true,
      message: 'Entry created successfully! 🎉',
      data: {
        entry: {
          _id: entry._id,
          mood: entry.mood,
          moodEmoji: entry.moodEmoji,
          moodIntensity: entry.moodIntensity,
          title: entry.title,
          notes: entry.notes,
          wordCount: entry.wordCount,
          tags: entry.tags,
          isPrivate: entry.isPrivate,
          entryDate: entry.entryDate,
          createdAt: entry.createdAt
        },
        rewards: {
          xp: xpResult,  // { base, bonus, total, breakdown }
          leveledUp,
          oldLevel,
          newLevel: user.level,
          streak: {
            currentStreak: user.streak,
            streakIncreased: streakResult.streakChanged,
            streakBroken: streakResult.streakBroken || false,
            milestone: streakResult.milestone || null,
            bonusXP: streakResult.bonusXP || 0,
            message: streakResult.message
          },
          newBadges,  // Array of newly earned badges
          challengesCompleted,
          challengeXP
        }
      }
    });

  } catch (error) {
    console.error('Create Entry Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create entry',
      error: error.message
    });
  }
};

// ════════════════════════════════════════════════════════════
// @desc    Get all user entries
// @route   GET /api/entries
// @access  Private
// ════════════════════════════════════════════════════════════
exports.getEntries = async (req, res) => {
  try {
    const { 
      mood, 
      tags, 
      category,
      startDate, 
      endDate, 
      limit = 20, 
      page = 1 
    } = req.query;

    // ========== BUILD FILTER ==========
    const filter = { user: req.user._id };

    if (mood) {
      filter.mood = mood.toLowerCase();
    }

    if (category) {
      filter.category = category;
    }

    if (tags) {
      filter.tags = { $in: tags.split(',').map(t => t.trim()) };
    }

    if (startDate || endDate) {
      filter.entryDate = {};
      if (startDate) filter.entryDate.$gte = new Date(startDate);
      if (endDate) filter.entryDate.$lte = new Date(endDate);
    }

    // ========== PAGINATION ==========
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // ========== GET ENTRIES ==========
    const entries = await Entry.find(filter)
      .sort({ entryDate: -1 })  // Newest first
      .limit(parseInt(limit))
      .skip(skip)
      .select('-__v');

    const total = await Entry.countDocuments(filter);

    // ========== RESPONSE ==========
    res.status(200).json({
      success: true,
      data: {
        entries,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalEntries: total,
          hasMore: skip + entries.length < total
        }
      }
    });

  } catch (error) {
    console.error('Get Entries Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch entries',
      error: error.message
    });
  }
};

// ════════════════════════════════════════════════════════════
// @desc    Get single entry
// @route   GET /api/entries/:id
// @access  Private
// ════════════════════════════════════════════════════════════
exports.getEntry = async (req, res) => {
  try {
    const entry = await Entry.findById(req.params.id);

    // ========== CHECK EXISTS ==========
    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Entry not found'
      });
    }

    // ========== CHECK OWNERSHIP ==========
    if (entry.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this entry'
      });
    }

    // ========== RESPONSE ==========
    res.status(200).json({
      success: true,
      data: entry
    });

  } catch (error) {
    console.error('Get Entry Error:', error);
    
    // Handle invalid MongoDB ID
    if (error.kind === 'ObjectId') {
      return res.status(404).json({
        success: false,
        message: 'Entry not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to fetch entry',
      error: error.message
    });
  }
};

// ════════════════════════════════════════════════════════════
// @desc    Update entry
// @route   PUT /api/entries/:id
// @access  Private
// ════════════════════════════════════════════════════════════
exports.updateEntry = async (req, res) => {
  try {
    let entry = await Entry.findById(req.params.id);

    // ========== CHECK EXISTS ==========
    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Entry not found'
      });
    }

    // ========== CHECK OWNERSHIP ==========
    if (entry.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this entry'
      });
    }

    // ========== UPDATE FIELDS ==========
    const allowedUpdates = [
      'mood', 
      'moodEmoji', 
      'moodIntensity', 
      'title', 
      'notes', 
      'tags', 
      'category',
      'location',
      'isPrivate'
    ];
    
    const updates = {};

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // ========== UPDATE ENTRY ==========
    entry = await Entry.findByIdAndUpdate(
      req.params.id,
      updates,
      {
        new: true,  // Return updated document
        runValidators: true
      }
    );

    // ========== RECALCULATE XP IF CONTENT CHANGED ==========
    if (updates.notes || updates.tags || updates.location) {
      const xpResult = calculateXP(entry);
      const xpDifference = xpResult.total - entry.xpAwarded;
      
      if (xpDifference !== 0) {
        // Update entry XP
        entry.xpAwarded = xpResult.total;
        await entry.save();
        
        // Update user XP
        const user = await User.findById(req.user._id);
        user.xp += xpDifference;
        user.level = calculateLevel(user.xp);
        await user.save();
      }
    }

    // ========== RESPONSE ==========
    res.status(200).json({
      success: true,
      message: 'Entry updated successfully',
      data: entry
    });

  } catch (error) {
    console.error('Update Entry Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update entry',
      error: error.message
    });
  }
};

// ════════════════════════════════════════════════════════════
// @desc    Delete entry
// @route   DELETE /api/entries/:id
// @access  Private
// ════════════════════════════════════════════════════════════
exports.deleteEntry = async (req, res) => {
  try {
    const entry = await Entry.findById(req.params.id);

    // ========== CHECK EXISTS ==========
    if (!entry) {
      return res.status(404).json({
        success: false,
        message: 'Entry not found'
      });
    }

    // ========== CHECK OWNERSHIP ==========
    if (entry.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this entry'
      });
    }

    // ========== DELETE ENTRY ==========
    await entry.deleteOne();

    // ========== RESPONSE ==========
    res.status(200).json({
      success: true,
      message: 'Entry deleted successfully'
    });

  } catch (error) {
    console.error('Delete Entry Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete entry',
      error: error.message
    });
  }
};

// ════════════════════════════════════════════════════════════
// @desc    Get today's entry
// @route   GET /api/entries/today
// @access  Private
// ════════════════════════════════════════════════════════════
exports.getTodayEntry = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const entry = await Entry.findOne({
      user: req.user._id,
      entryDate: { $gte: today, $lt: tomorrow }
    });

    if (!entry) {
      return res.status(200).json({
        success: true,
        data: {
          hasEntryToday: false,
          entry: null
        }
      });
    }

    res.status(200).json({
      success: true,
      data: {
        hasEntryToday: true,
        entry
      }
    });

  } catch (error) {
    console.error('Get Today Entry Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch today\'s entry',
      error: error.message
    });
  }
};

// ════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ════════════════════════════════════════════════════════════
function getMoodEmoji(mood) {
  const emojiMap = {
    amazing: '🤩',
    happy: '😊',
    neutral: '😐',
    sad: '😢',
    angry: '😠',
    anxious: '😰',
    stressed: '😫',
    excited: '🤗'
  };
  return emojiMap[mood.toLowerCase()] || '😊';
}
