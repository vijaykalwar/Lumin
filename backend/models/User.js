const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6
  },
  
  // ========== GAMIFICATION FIELDS ==========
  xp: {
    type: Number,
    default: 0,
    min: 0
  },
  level: {
    type: Number,
    default: 1,
    min: 1
  },
  streak: {
    type: Number,
    default: 0,
    min: 0
  },
  lastEntryDate: {
    type: Date,
    default: null
  },
  
  // ========== BADGES ==========
  badges: [{
    name: String,           // 'fire-starter'
    displayName: String,    // '🔥 Fire Starter'
    earnedAt: {
      type: Date,
      default: Date.now
    },
    xpAwarded: Number
  }],
  
   // 🆕 PROFILE FIELDS
  avatar: { 
    type: String, 
    default: 'https://ui-avatars.com/api/?name=User&background=random' 
  },
  bio: { 
    type: String, 
    maxlength: 500,
    default: '' 
  },
  location: {
    type: String,
    maxlength: 100,
    default: ''
  },
  dateOfBirth: Date,
  occupation: {
    type: String,
    maxlength: 100,
    default: ''
  },
  
  // ========== SETTINGS ==========
  settings: {
    emailNotifications: { type: Boolean, default: true },
    dailyReminder: { type: Boolean, default: true },
    reminderTime: { type: String, default: '09:00' },
    theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
    language: { type: String, default: 'en' }
  }
},
  
{
  timestamps: true
});

// ════════════════════════════════════════════════════════════
// ✅ INDEXES FOR PERFORMANCE
// ════════════════════════════════════════════════════════════
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ level: -1 }); // For leaderboards
userSchema.index({ xp: -1 }); // For ranking

module.exports = mongoose.model('User', userSchema);
