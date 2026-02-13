const User = require('../models/User');
const Entry = require('../models/Entry');

const emailService = require('../services/emailService'); 
// ════════════════════════════════════════════════════════════
// CALCULATE XP FOR ENTRY
// ════════════════════════════════════════════════════════════
exports.calculateXP = (entry) => {
  let base = 50;
  let bonus = 0;
  let breakdown = [];

  // ========== WORD COUNT BONUS ==========
  if (entry.wordCount >= 100) {
    bonus += 25;
    breakdown.push({ reason: 'Detailed entry (100+ words)', xp: 25 });
  }

  // ========== TAGS BONUS ==========
  if (entry.tags && entry.tags.length >= 3) {
    bonus += 10;
    breakdown.push({ reason: 'Well-categorized (3+ tags)', xp: 10 });
  }

  // ========== LOCATION BONUS ==========
  if (entry.location && entry.location.enabled) {
    bonus += 5;
    breakdown.push({ reason: 'Geo-tagged entry', xp: 5 });
  }

  // ========== TITLE BONUS ==========
  if (entry.title && entry.title.length > 0) {
    bonus += 5;
    breakdown.push({ reason: 'Added title', xp: 5 });
  }

  return {
    base,
    bonus,
    total: base + bonus,
    breakdown: [{ reason: 'Base entry XP', xp: base }, ...breakdown]
  };
};

// ════════════════════════════════════════════════════════════
// CALCULATE LEVEL FROM XP
// ════════════════════════════════════════════════════════════
exports.calculateLevel = (xp) => {
  const levels = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500, 5500, 6600, 7800, 9100, 10500];
  
  for (let i = levels.length - 1; i >= 0; i--) {
    if (xp >= levels[i]) return i + 1;
  }
  return 1;
};

// ════════════════════════════════════════════════════════════
// GET XP NEEDED FOR NEXT LEVEL
// ════════════════════════════════════════════════════════════
exports.xpForNextLevel = (currentLevel) => {
  const levels = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500, 5500, 6600, 7800, 9100, 10500];
  return levels[currentLevel] || levels[levels.length - 1];
};

// ════════════════════════════════════════════════════════════
// UPDATE USER STREAK
// ════════════════════════════════════════════════════════════

exports.updateStreak = async (userId) => {
  try {
    const user = await User.findById(userId);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastEntry = user.lastEntryDate ? new Date(user.lastEntryDate) : null;

    if (lastEntry) {
      lastEntry.setHours(0, 0, 0, 0);
      const daysDiff = Math.floor((today - lastEntry) / (1000 * 60 * 60 * 24));

      if (daysDiff === 1) {
        // Consecutive day
        user.streak += 1;
        
        // ✨ Update best streak if current streak is higher
        if (user.streak > (user.bestStreak || 0)) {
          user.bestStreak = user.streak;
        }
        
        // 🆕 Check for milestone (7, 14, 30, 50, 100 days)
        const milestones = [7, 14, 30, 50, 100];
        if (milestones.includes(user.streak)) {
          const bonusXP = user.streak * 5;
          user.xp += bonusXP;
          
          // Send milestone email
          emailService.sendStreakMilestoneEmail(user, bonusXP).catch(err => {
            console.error('Streak milestone email failed:', err);
          });
        }
        
      } else if (daysDiff > 1) {
        // Streak broken
        user.streak = 1;
      }
    } else {
      // First entry
      user.streak = 1;
    }

    user.lastEntryDate = today;
    await user.save();

    return {
      currentStreak: user.streak,
      streakChanged: true
    };

  } catch (error) {
    console.error('Streak update error:', error);
    return { success: false, error: error.message };
  }
};

// ════════════════════════════════════════════════════════════
// CHECK AND AWARD BADGES
// ════════════════════════════════════════════════════════════
exports.checkBadges = async (user) => {
  const newBadges = [];
  const existing = user.badges.map(b => b.name);

  // ========== BADGE DEFINITIONS ==========
  const badges = [
    // Entry-based badges
    { 
      name: 'first-entry', 
      displayName: '📝 First Step', 
      check: async () => {
        const count = await Entry.countDocuments({ user: user._id });
        return count >= 1;
      }, 
      xp: 25,
      description: 'Created your first journal entry'
    },
    { 
      name: 'consistent-writer', 
      displayName: '✍️ Consistent Writer', 
      check: async () => {
        const count = await Entry.countDocuments({ user: user._id });
        return count >= 10;
      }, 
      xp: 50,
      description: 'Wrote 10 journal entries'
    },
    { 
      name: 'prolific-author', 
      displayName: '📚 Prolific Author', 
      check: async () => {
        const count = await Entry.countDocuments({ user: user._id });
        return count >= 50;
      }, 
      xp: 150,
      description: 'Wrote 50 journal entries'
    },

    // Streak-based badges
    { 
      name: 'fire-starter', 
      displayName: '🔥 Fire Starter', 
      check: () => user.streak >= 3, 
      xp: 50,
      description: 'Maintained a 3-day streak'
    },
    { 
      name: 'week-warrior', 
      displayName: '💪 Week Warrior', 
      check: () => user.streak >= 7, 
      xp: 100,
      description: 'Maintained a 7-day streak'
    },
    { 
      name: 'month-master', 
      displayName: '🏆 Month Master', 
      check: () => user.streak >= 30, 
      xp: 500,
      description: 'Maintained a 30-day streak'
    },
    { 
      name: 'unstoppable', 
      displayName: '⚡ Unstoppable', 
      check: () => user.streak >= 100, 
      xp: 2000,
      description: 'Maintained a 100-day streak'
    },

    // Level-based badges
    { 
      name: 'level-5', 
      displayName: '⭐ Rising Star', 
      check: () => user.level >= 5, 
      xp: 100,
      description: 'Reached Level 5'
    },
    { 
      name: 'level-10', 
      displayName: '🌟 Shining Bright', 
      check: () => user.level >= 10, 
      xp: 250,
      description: 'Reached Level 10'
    }
  ];

  // ========== CHECK EACH BADGE ==========
  for (const badge of badges) {
    // Skip if already earned
    if (existing.includes(badge.name)) continue;
    
    try {
      const unlocked = await badge.check();
      
      if (unlocked) {
        // Add badge to user
        user.badges.push({ 
          name: badge.name, 
          displayName: badge.displayName,
          description: badge.description,
          earnedAt: new Date(), 
          xpAwarded: badge.xp 
        });
        
        // Award XP
        user.xp += badge.xp;
        
        // Track for response
        newBadges.push({ 
          name: badge.name, 
          displayName: badge.displayName,
          description: badge.description,
          xp: badge.xp 
        });
      }
    } catch (error) {
      console.error(`Error checking badge ${badge.name}:`, error);
    }
  }

  // ========== SAVE IF NEW BADGES ==========
  if (newBadges.length > 0) {
    await user.save();
  }

  return newBadges;
};

// ════════════════════════════════════════════════════════════
// CHECK IF USER LEVELED UP
// ════════════════════════════════════════════════════════════
exports.checkLevelUp = (oldXP, newXP) => {
  const oldLevel = exports.calculateLevel(oldXP);
  const newLevel = exports.calculateLevel(newXP);
  
  return {
    leveledUp: newLevel > oldLevel,
    oldLevel,
    newLevel
  };
};