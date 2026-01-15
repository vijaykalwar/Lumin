const mongoose = require('mongoose');

const entrySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Entry must belong to a user'],
    index: true
  },

  mood: {
    type: String,
    required: [true, 'Mood is required'],
    enum: ['amazing', 'happy', 'neutral', 'sad', 'angry', 'anxious', 'stressed', 'excited'],
    lowercase: true
  },
  
  moodEmoji: {
    type: String,
    required: true,
    default: function() {
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
      return emojiMap[this.mood] || '😊';
    }
  },

  moodIntensity: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },

  title: {
    type: String,
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters'],
    default: ''
  },

  notes: {
    type: String,
    required: [true, 'Entry notes are required'],
    trim: true,
    minlength: [10, 'Entry must be at least 10 characters'],
    maxlength: [5000, 'Entry cannot exceed 5000 characters']
  },

  tags: [{
    type: String,
    lowercase: true,
    trim: true
  }],

  category: {
    type: String,
    enum: ['personal', 'work', 'health', 'goals', 'gratitude', 'reflection', 'other'],
    default: 'personal',
    lowercase: true
  },

  location: {
    enabled: {
      type: Boolean,
      default: false
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    placeName: String,
    city: String,
    country: String
  },

  isPrivate: {
    type: Boolean,
    default: true
  },

  wordCount: {
    type: Number,
    default: 0
  },

  entryDate: {
    type: Date,
    default: Date.now,
    index: true
  },

  xpAwarded: {
    type: Number,
    default: 0
  },

  linkedPomodoro: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PomodoroSession',
    default: null
  }

}, {
  timestamps: true
});

// ════════════════════════════════════════════════════════════
// INDEXES FOR PERFORMANCE
// ════════════════════════════════════════════════════════════
entrySchema.index({ user: 1, entryDate: -1 });
entrySchema.index({ user: 1, mood: 1 });
entrySchema.index({ user: 1, category: 1 });
entrySchema.index({ tags: 1 });

// ════════════════════════════════════════════════════════════
// PRE-SAVE MIDDLEWARE - Calculate word count
// ════════════════════════════════════════════════════════════
entrySchema.pre('save', function () {
  if (this.notes) {
    this.wordCount = this.notes
      .trim()
      .split(/\s+/)
      .filter(word => word.length > 0).length;
  }
});


// ════════════════════════════════════════════════════════════
// VIRTUAL FIELDS
// ════════════════════════════════════════════════════════════

// Check if entry is detailed (100+ words)
entrySchema.virtual('isDetailed').get(function() {
  return this.wordCount >= 100;
});

// Get formatted date - FIXED
entrySchema.virtual('formattedDate').get(function() {
  if (!this.entryDate) return 'No date';  // ✅ FIX
  
  try {
    return this.entryDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch (error) {
    return 'Invalid date';
  }
});

// Enable virtuals in JSON
entrySchema.set('toJSON', { virtuals: true });
entrySchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Entry', entrySchema);