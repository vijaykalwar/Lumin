const mongoose = require('mongoose');

// ════════════════════════════════════════════════════════════
// TEAM SCHEMA - Team Collaboration
// ════════════════════════════════════════════════════════════
const teamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },

  description: {
    type: String,
    trim: true,
    maxlength: 500
  },

  // Team owner
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Members
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['admin', 'member'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    totalXP: {
      type: Number,
      default: 0
    },
    totalEntries: {
      type: Number,
      default: 0
    }
  }],

  // Team goals
  sharedGoals: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Goal'
  }],

  // Team stats
  teamStreak: {
    type: Number,
    default: 0
  },

  totalTeamXP: {
    type: Number,
    default: 0
  },

  // Settings
  isPrivate: {
    type: Boolean,
    default: false
  },

  maxMembers: {
    type: Number,
    default: 20
  },

  // Invite codes
  inviteCode: {
    type: String,
    unique: true,
    sparse: true
  }

}, {
  timestamps: true
});

// ════════════════════════════════════════════════════════════
// INDEXES
// ════════════════════════════════════════════════════════════
teamSchema.index({ owner: 1 });
teamSchema.index({ 'members.user': 1 });


// ════════════════════════════════════════════════════════════
// VIRTUAL FIELDS
// ════════════════════════════════════════════════════════════

// Member count
teamSchema.virtual('memberCount').get(function() {
  return this.members.length;
});

// Check if team is full
teamSchema.virtual('isFull').get(function() {
  return this.members.length >= this.maxMembers;
});

// Enable virtuals
teamSchema.set('toJSON', { virtuals: true });
teamSchema.set('toObject', { virtuals: true });

// ════════════════════════════════════════════════════════════
// METHODS
// ════════════════════════════════════════════════════════════

// Add member
teamSchema.methods.addMember = function(userId, role = 'member') {
  // Check if already a member
  const exists = this.members.find(
    m => m.user.toString() === userId.toString()
  );
  
  if (exists) {
    throw new Error('User is already a member');
  }
  
  if (this.isFull) {
    throw new Error('Team is full');
  }
  
  this.members.push({
    user: userId,
    role
  });
  
  return this.save();
};

// Remove member
teamSchema.methods.removeMember = function(userId) {
  this.members = this.members.filter(
    m => m.user.toString() !== userId.toString()
  );
  
  return this.save();
};

// Check if user is member
teamSchema.methods.isMember = function(userId) {
  return this.members.some(
    m => m.user.toString() === userId.toString()
  );
};

// Check if user is admin
teamSchema.methods.isAdmin = function(userId) {
  const member = this.members.find(
    m => m.user.toString() === userId.toString()
  );
  
  return member && (member.role === 'admin' || this.owner.toString() === userId.toString());
};

// Generate invite code
teamSchema.methods.generateInviteCode = function() {
  const code = Math.random().toString(36).substring(2, 10).toUpperCase();
  this.inviteCode = code;
  return this.save();
};

module.exports = mongoose.model('Team', teamSchema);