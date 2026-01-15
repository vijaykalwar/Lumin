const mongoose = require('mongoose');

// ════════════════════════════════════════════════════════════
// POMODORO SESSION SCHEMA
// ════════════════════════════════════════════════════════════
const pomodoroSessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Session details
  type: {
    type: String,
    enum: ['focus', 'short-break', 'long-break'],
    required: true,
    default: 'focus'
  },

  duration: {
    type: Number, // in minutes
    required: true,
    default: 25
  },

  // Task/Goal linked
  task: {
    type: String,
    trim: true,
    maxlength: 200
  },

  linkedGoal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Goal',
    default: null
  },

  linkedEntry: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Entry',
    default: null
  },

  // Completion tracking
  completed: {
    type: Boolean,
    default: false
  },

  completedAt: {
    type: Date,
    default: null
  },

  startedAt: {
    type: Date,
    default: Date.now
  },

  // Interruptions
  paused: {
    type: Boolean,
    default: false
  },

  pausedDuration: {
    type: Number, // in seconds
    default: 0
  },

  // Rewards
  xpAwarded: {
    type: Number,
    default: 0
  },

  // Notes
  notes: {
    type: String,
    maxlength: 500
  },

  // Session number in series
  sessionNumber: {
    type: Number,
    default: 1
  }

}, {
  timestamps: true
});

// ════════════════════════════════════════════════════════════
// INDEXES
// ════════════════════════════════════════════════════════════
pomodoroSessionSchema.index({ user: 1, createdAt: -1 });
pomodoroSessionSchema.index({ user: 1, completed: 1 });

// ════════════════════════════════════════════════════════════
// VIRTUAL FIELDS
// ════════════════════════════════════════════════════════════

// Get formatted duration
pomodoroSessionSchema.virtual('formattedDuration').get(function() {
  return `${this.duration} min`;
});

// Check if session is a break
pomodoroSessionSchema.virtual('isBreak').get(function() {
  return this.type.includes('break');
});

// Enable virtuals in JSON
pomodoroSessionSchema.set('toJSON', { virtuals: true });
pomodoroSessionSchema.set('toObject', { virtuals: true });

// ════════════════════════════════════════════════════════════
// METHODS
// ════════════════════════════════════════════════════════════

// Complete session and award XP
pomodoroSessionSchema.methods.completeSession = function() {
  this.completed = true;
  this.completedAt = new Date();
  
  // Calculate XP based on type
  if (this.type === 'focus') {
    this.xpAwarded = 40; // Focus session
  } else if (this.type === 'short-break') {
    this.xpAwarded = 10; // Short break
  } else {
    this.xpAwarded = 20; // Long break
  }
  
  return this.save();
};

module.exports = mongoose.model('PomodoroSession', pomodoroSessionSchema);