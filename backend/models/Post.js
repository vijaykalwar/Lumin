const mongoose = require('mongoose');

// ════════════════════════════════════════════════════════════
// POST SCHEMA - Community Feed
// ════════════════════════════════════════════════════════════
const postSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Post content
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },

  // Post type
  type: {
    type: String,
    enum: ['update', 'achievement', 'goal', 'milestone', 'streak'],
    default: 'update'
  },

  // Linked content
  linkedEntry: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Entry',
    default: null
  },

  linkedGoal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Goal',
    default: null
  },

  linkedBadge: {
    name: String,
    displayName: String
  },

  // Reactions
  reactions: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    type: {
      type: String,
      enum: ['heart', 'fire', 'clap', 'muscle', 'star'],
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Comments
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      maxlength: 500
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Privacy
  isPublic: {
    type: Boolean,
    default: true
  },

  // Team post
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    default: null
  },

  // Metadata
  viewCount: {
    type: Number,
    default: 0
  }

}, {
  timestamps: true
});

// ════════════════════════════════════════════════════════════
// INDEXES
// ════════════════════════════════════════════════════════════
postSchema.index({ user: 1, createdAt: -1 });
postSchema.index({ type: 1, createdAt: -1 });
postSchema.index({ team: 1, createdAt: -1 });
postSchema.index({ isPublic: 1, createdAt: -1 });

// ════════════════════════════════════════════════════════════
// VIRTUAL FIELDS
// ════════════════════════════════════════════════════════════

// Reaction counts
postSchema.virtual('reactionCounts').get(function() {
  const counts = {
    heart: 0,
    fire: 0,
    clap: 0,
    muscle: 0,
    star: 0,
    total: this.reactions.length
  };

  this.reactions.forEach(reaction => {
    counts[reaction.type]++;
  });

  return counts;
});

// Comment count
postSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

// Enable virtuals
postSchema.set('toJSON', { virtuals: true });
postSchema.set('toObject', { virtuals: true });

// ════════════════════════════════════════════════════════════
// METHODS
// ════════════════════════════════════════════════════════════

// Add reaction
postSchema.methods.addReaction = function(userId, reactionType) {
  // Remove existing reaction from this user
  this.reactions = this.reactions.filter(
    r => r.user.toString() !== userId.toString()
  );
  
  // Add new reaction
  this.reactions.push({
    user: userId,
    type: reactionType
  });
  
  return this.save();
};

// Remove reaction
postSchema.methods.removeReaction = function(userId) {
  this.reactions = this.reactions.filter(
    r => r.user.toString() !== userId.toString()
  );
  
  return this.save();
};

// Add comment
postSchema.methods.addComment = function(userId, content) {
  this.comments.push({
    user: userId,
    content
  });
  
  return this.save();
};

// Delete comment
postSchema.methods.deleteComment = function(commentId) {
  this.comments = this.comments.filter(
    c => c._id.toString() !== commentId.toString()
  );
  
  return this.save();
};

module.exports = mongoose.model('Post', postSchema);