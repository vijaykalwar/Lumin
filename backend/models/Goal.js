const mongoose = require('mongoose');

// ════════════════════════════════════════════════════════════
// GOAL SCHEMA - SMART Goals Model
// ════════════════════════════════════════════════════════════
const goalSchema = new mongoose.Schema({
  // ========== USER REFERENCE ==========
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Goal must belong to a user'],
    index: true
  },

  // ========== SMART CRITERIA ==========
  title: {
    type: String,
    required: [true, 'Goal title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },

  // Specific
  description: {
    type: String,
    required: [true, 'Goal description is required'],
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },

  // Measurable
  metric: {
    type: String,
    required: true,
    trim: true
  },

  targetValue: {
    type: Number,
    required: true,
    min: 0
  },

  currentValue: {
    type: Number,
    default: 0,
    min: 0
  },

  unit: {
    type: String,
    default: 'units'
  },

  // Achievable & Relevant
  category: {
    type: String,
    required: true,
    enum: ['career', 'health', 'learning', 'finance', 'relationships', 'hobbies', 'other'],
    lowercase: true
  },

  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
    
  },

  // Time-bound
  startDate: {
    type: Date,
    default: Date.now
  },

  targetDate: {
    type: Date,
    required: [true, 'Target date is required']
  },

  // ========== MILESTONES ==========
  milestones: [{
    title: {
      type: String,
      required: true
    },
    description: String,
    targetValue: Number,
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: Date,
    xpReward: {
      type: Number,
      default: 25
    }
  }],

  // ========== STATUS ==========
  status: {
    type: String,
    enum: ['active', 'completed', 'abandoned', 'paused'],
    default: 'active'
  },

  completedAt: Date,

  // ========== REWARDS ==========
  xpReward: {
    type: Number,
    default: 200
  },

  badgeAwarded: {
    type: String,
    default: null
  },

  // ========== METADATA ==========
  tags: [{
    type: String,
    lowercase: true,
    trim: true
  }],

  notes: String,

  linkedEntries: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Entry'
  }],

  reminderEnabled: {
    type: Boolean,
    default: true
  },

  reminderTime: String

}, {
  timestamps: true
});

// ════════════════════════════════════════════════════════════
// INDEXES
// ════════════════════════════════════════════════════════════
goalSchema.index({ user: 1, status: 1 });
goalSchema.index({ user: 1, category: 1 });
goalSchema.index({ targetDate: 1 });

// ════════════════════════════════════════════════════════════
// VIRTUAL FIELDS
// ════════════════════════════════════════════════════════════

// Calculate progress percentage
goalSchema.virtual('progressPercentage').get(function() {
  if (this.targetValue === 0) return 0;
  return Math.min(Math.round((this.currentValue / this.targetValue) * 100), 100);
});

// Check if overdue
goalSchema.virtual('isOverdue').get(function() {
  if (this.status === 'completed') return false;
  return new Date() > this.targetDate;
});

// Days remaining
goalSchema.virtual('daysRemaining').get(function() {
  if (this.status === 'completed') return 0;
  const now = new Date();
  const target = new Date(this.targetDate);
  const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
  return Math.max(diff, 0);
});

// Milestone completion percentage
goalSchema.virtual('milestoneProgress').get(function() {
  if (!this.milestones || this.milestones.length === 0) return 0;
  const completed = this.milestones.filter(m => m.completed).length;
  return Math.round((completed / this.milestones.length) * 100);
});

// Enable virtuals in JSON
goalSchema.set('toJSON', { virtuals: true });
goalSchema.set('toObject', { virtuals: true });

// ════════════════════════════════════════════════════════════
// METHODS
// ════════════════════════════════════════════════════════════

// Update progress
goalSchema.methods.updateProgress = function(newValue) {
  this.currentValue = newValue;
  
  if (this.currentValue >= this.targetValue && this.status !== 'completed') {
    this.status = 'completed';
    this.completedAt = new Date();
  }
  
  return this.save();
};

// Complete milestone
goalSchema.methods.completeMilestone = function(milestoneId) {
  const milestone = this.milestones.id(milestoneId);
  if (milestone) {
    milestone.completed = true;
    milestone.completedAt = new Date();
  }
  return this.save();
};

module.exports = mongoose.model('Goal', goalSchema);