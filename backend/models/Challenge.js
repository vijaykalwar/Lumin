const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  date: {
    type: Date,
    required: true,
    index: true
  },

  challenges: [{
    type: {
      type: String,
      enum: [
        'word-count',      // Write X+ words
        'early-bird',      // Journal before 9 AM
        'night-owl',       // Journal after 10 PM
        'tag-master',      // Use 3+ tags
        'streak-keeper',   // Maintain streak
        'mood-variety',    // Log different mood
        'detailed-entry',  // 200+ words
        'grateful',        // Mention gratitude
        'reflection'       // Answer reflection prompt
      ],
      required: true
    },
    
    title: String,
    description: String,
    
    target: Number,
    progress: {
      type: Number,
      default: 0
    },
    
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: Date,
    
    xpReward: {
      type: Number,
      default: 50
    }
  }],

  totalXPEarned: {
    type: Number,
    default: 0
  },

  completedCount: {
    type: Number,
    default: 0
  }

}, {
  timestamps: true
});

// Index for fetching today's challenges
challengeSchema.index({ user: 1, date: 1 });

// Method to check completion
challengeSchema.methods.checkCompletion = function() {
  this.completedCount = this.challenges.filter(c => c.completed).length;
  this.totalXPEarned = this.challenges
    .filter(c => c.completed)
    .reduce((sum, c) => sum + c.xpReward, 0);
  return this.save();
};

module.exports = mongoose.model('Challenge', challengeSchema);
