const Goal = require('../models/Goal');
const User = require('../models/User');
const { sanitizeInput, sanitizeArray } = require('../utils/sanitize');
const { calculateLevel } = require('../utils/gamification');
const emailService = require('../services/emailService');
// ════════════════════════════════════════════════════════════
// @desc    Create new goal
// @route   POST /api/goals
// @access  Private
// ════════════════════════════════════════════════════════════
exports.createGoal = async (req, res) => {
  try {
    let {
      title,
      description,
      metric,
      targetValue,
      unit,
      category,
      priority,
      targetDate,
      milestones,
      tags
    } = req.body;

    // ========== XSS SANITIZATION ==========
    title = title ? sanitizeInput(String(title)) : '';
    description = description ? sanitizeInput(String(description)) : '';
    metric = metric ? sanitizeInput(String(metric)) : 'Progress';
    tags = Array.isArray(tags) ? sanitizeArray(tags) : [];
    if (Array.isArray(milestones)) {
      milestones = milestones.map((m) => ({
        ...m,
        title: m.title ? sanitizeInput(String(m.title)) : '',
        description: m.description ? sanitizeInput(String(m.description)) : ''
      }));
    }

    // ========== VALIDATION ==========
    if (!title || !description || !targetValue || !targetDate || !category) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // ========== CREATE GOAL ==========
    const goal = await Goal.create({
      user: req.user._id,
      title,
      description,
      metric: metric || 'Progress',
      targetValue,
      unit: unit || 'units',
      category,
      priority: priority || 'medium',
      targetDate,
      milestones: milestones || [],
      tags: tags || []
    });

    // ========== AWARD XP FOR GOAL CREATION ==========
    const user = await User.findById(req.user._id);
    user.xp += 50; // Bonus for setting a goal
    user.level = calculateLevel(user.xp);
    await user.save();

    // ========== RESPONSE ==========
    res.status(201).json({
      success: true,
      message: 'Goal created successfully! +50 XP',
      data: {
        goal,
        xpEarned: 50,
        newLevel: user.level
      }
    });

  } catch (error) {
    console.error('Create Goal Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create goal',
      error: error.message
    });
  }
};

// ════════════════════════════════════════════════════════════
// @desc    Get all user goals
// @route   GET /api/goals
// @access  Private
// ════════════════════════════════════════════════════════════
exports.getGoals = async (req, res) => {
  try {
    const { 
      query,           // NEW: Text search
      status, 
      category,
      priority,        // NEW: Priority filter
      sortBy = 'date', // NEW: Sort option (date, progress, deadline, priority)
      sortOrder = 'desc', // NEW: Sort order
      limit = 20, 
      page = 1 
    } = req.query;

    // ========== BUILD FILTER ==========
    const filter = { user: req.user._id };

    // NEW: Text search in title and description
    if (query) {
      filter.$or = [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ];
    }

    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;

    // ========== BUILD SORT ==========
    const sortOptions = {};
    if (sortBy === 'progress') {
      sortOptions.currentValue = sortOrder === 'asc' ? 1 : -1;
    } else if (sortBy === 'deadline') {
      sortOptions.targetDate = sortOrder === 'asc' ? 1 : -1;
    } else if (sortBy === 'priority') {
      // Custom sort: high > medium > low
      sortOptions.priority = sortOrder === 'asc' ? 1 : -1;
    } else {
      sortOptions.createdAt = sortOrder === 'asc' ? 1 : -1; // Default: date
    }

    // ========== PAGINATION ==========
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // ========== GET GOALS WITH PAGINATION ==========
    const goals = await Goal.find(filter)
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip(skip)
      .select('-__v')
      .lean();

    const total = await Goal.countDocuments(filter);

    // ========== STATISTICS (from all goals, not just paginated) ==========
    const allGoals = await Goal.find({ user: req.user._id }).lean();
    const stats = {
      total: allGoals.length,
      active: allGoals.filter(g => g.status === 'active').length,
      completed: allGoals.filter(g => g.status === 'completed').length,
      overdue: allGoals.filter(g => {
        if (g.status === 'completed') return false;
        return new Date() > new Date(g.targetDate);
      }).length
    };

    // ========== RESPONSE ==========
    res.status(200).json({
      success: true,
      count: goals.length,
      stats,
      data: {
        goals,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalGoals: total,
          hasMore: skip + goals.length < total
        },
        // NEW: Return applied filters for UI
        appliedFilters: {
          query: query || null,
          status: status || null,
          category: category || null,
          priority: priority || null,
          sortBy,
          sortOrder
        }
      }
    });

  } catch (error) {
    console.error('Get Goals Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch goals',
      error: error.message
    });
  }
};

// ════════════════════════════════════════════════════════════
// @desc    Get single goal
// @route   GET /api/goals/:id
// @access  Private
// ════════════════════════════════════════════════════════════
exports.getGoal = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id).lean();

    // ========== CHECK EXISTS ==========
    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    // ========== CHECK OWNERSHIP ==========
    if (goal.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this goal'
      });
    }

    // ========== RESPONSE ==========
    res.status(200).json({
      success: true,
      data: goal
    });

  } catch (error) {
    console.error('Get Goal Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch goal',
      error: error.message
    });
  }
};

// ════════════════════════════════════════════════════════════
// @desc    Update goal
// @route   PUT /api/goals/:id
// @access  Private
// ════════════════════════════════════════════════════════════
exports.updateGoal = async (req, res) => {
  try {
    let goal = await Goal.findById(req.params.id);

    // ========== CHECK EXISTS ==========
    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    // ========== CHECK OWNERSHIP ==========
    if (goal.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this goal'
      });
    }

    // ========== UPDATE GOAL ==========
    const allowedUpdates = [
      'title', 'description', 'metric', 'targetValue', 'currentValue',
      'unit', 'category', 'priority', 'targetDate', 'status', 'notes', 'tags'
    ];

    const updates = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    goal = await Goal.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    // ========== RESPONSE ==========
    res.status(200).json({
      success: true,
      message: 'Goal updated successfully',
      data: goal
    });

  } catch (error) {
    console.error('Update Goal Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update goal',
      error: error.message
    });
  }
};

// ════════════════════════════════════════════════════════════
// @desc    Update goal progress
// @route   PATCH /api/goals/:id/progress
// @access  Private
// ════════════════════════════════════════════════════════════
// Update progress - send email when goal completed
exports.updateProgress = async (req, res) => {
  try {
    const { currentValue } = req.body;
    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    // Update progress
    goal.currentValue = currentValue;

    // Check if goal is completed
    if (goal.currentValue >= goal.targetValue && goal.status !== 'completed') {
      goal.status = 'completed';
      goal.completedAt = new Date();

      // Award XP
      const user = await User.findById(req.user._id);
      user.xp += goal.xpReward;
      await user.save();

emailService.sendGoalCompletedEmail(user, goal).catch(err => {
console.error('Goal completion email failed:', err);
});
}
await goal.save();

res.status(200).json({
  success: true,
  data: goal
});
} catch (error) {
console.error('Update progress error:', error);
res.status(500).json({
success: false,
message: 'Failed to update progress',
error: error.message
});
}
};
      //
// ════════════════════════════════════════════════════════════
// @desc    Complete milestone
// @route   PATCH /api/goals/:id/milestones/:milestoneId
// @access  Private
// ════════════════════════════════════════════════════════════
exports.completeMilestone = async (req, res) => {
  try {
    const { id, milestoneId } = req.params;

    let goal = await Goal.findById(id);

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    if (goal.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // ========== COMPLETE MILESTONE ==========
    await goal.completeMilestone(milestoneId);

    const milestone = goal.milestones.id(milestoneId);
    const xpEarned = milestone.xpReward;

    // ========== AWARD XP ==========
    const user = await User.findById(req.user._id);
    user.xp += xpEarned;
    user.level = calculateLevel(user.xp);
    await user.save();

    // ========== RESPONSE ==========
    res.status(200).json({
      success: true,
      message: `Milestone completed! +${xpEarned} XP`,
      data: {
        goal,
        xpEarned,
        newLevel: user.level
      }
    });

  } catch (error) {
    console.error('Complete Milestone Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete milestone',
      error: error.message
    });
  }
};

// ════════════════════════════════════════════════════════════
// @desc    Delete goal
// @route   DELETE /api/goals/:id
// @access  Private
// ════════════════════════════════════════════════════════════
exports.deleteGoal = async (req, res) => {
  try {
    const goal = await Goal.findById(req.params.id);

    if (!goal) {
      return res.status(404).json({
        success: false,
        message: 'Goal not found'
      });
    }

    if (goal.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this goal'
      });
    }

    await goal.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Goal deleted successfully'
    });

  } catch (error) {
    console.error('Delete Goal Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete goal',
      error: error.message
    });
  }
};

// ════════════════════════════════════════════════════════════
// @desc    Get goal statistics
// @route   GET /api/goals/stats/overview
// @access  Private
// ════════════════════════════════════════════════════════════
exports.getGoalStats = async (req, res) => {
  try {
    // ✅ OPTIMIZED: Use lean() and calculate stats in single pass
    const goals = await Goal.find({ user: req.user._id }).lean();

    // ========== CALCULATE STATS IN SINGLE PASS ==========
    const now = new Date();
    let total = 0, active = 0, completed = 0, paused = 0, abandoned = 0, overdue = 0;
    let totalProgress = 0;
    const byCategory = {};
    const categories = ['career', 'health', 'learning', 'finance', 'relationships', 'hobbies', 'other'];
    
    // Initialize category counters
    categories.forEach(cat => {
      byCategory[cat] = { total: 0, completed: 0 };
    });

    // Single pass through goals
    goals.forEach(goal => {
      total++;
      if (goal.status === 'active') active++;
      else if (goal.status === 'completed') completed++;
      else if (goal.status === 'paused') paused++;
      else if (goal.status === 'abandoned') abandoned++;
      
      // Check overdue
      if (goal.status !== 'completed' && new Date(goal.targetDate) < now) {
        overdue++;
      }
      
      // Calculate progress percentage
      const progress = goal.targetValue > 0 
        ? Math.min(Math.round((goal.currentValue / goal.targetValue) * 100), 100)
        : 0;
      totalProgress += progress;
      
      // Category stats
      if (byCategory[goal.category]) {
        byCategory[goal.category].total++;
        if (goal.status === 'completed') {
          byCategory[goal.category].completed++;
        }
      }
    });

    const stats = {
      total,
      active,
      completed,
      paused,
      abandoned,
      overdue,
      byCategory,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
      avgProgress: total > 0 ? Math.round(totalProgress / total) : 0
    };

    // ========== RESPONSE ==========
    res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Get Goal Stats Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch goal statistics',
      error: error.message
    });
  }
};