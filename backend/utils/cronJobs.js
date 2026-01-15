
const cron = require('node-cron');
const User = require('../models/User');
const emailService = require('../services/emailService');

// Daily reminder prompts
const journalPrompts = [
  "What made you smile today? What challenged you?",
  "What are you grateful for right now?",
  "What did you learn about yourself today?",
  "How did you step out of your comfort zone today?",
  "What's one thing you'd like to improve tomorrow?",
  "Who or what inspired you today?",
  "What's a small win you achieved today?",
  "How did you practice self-care today?"
];

// ═══════════════════════════════════════════════════════════
// ⏰ DAILY REMINDER CRON JOB
// Runs every day at each user's preferred time
// ═══════════════════════════════════════════════════════════
const setupDailyReminders = () => {
  
  // Run every hour to check for users
  cron.schedule('0 * * * *', async () => {
    try {
      const currentHour = new Date().getHours();
      const currentTime = `${currentHour.toString().padStart(2, '0')}:00`;

      console.log(`⏰ Checking for daily reminders at ${currentTime}`);

      // Find users who want reminders at this time
      const users = await User.find({
        'settings.dailyReminder': true,
        'settings.reminderTime': currentTime
      });

      console.log(`📧 Found ${users.length} users for reminders`);

      // Send reminders
      for (const user of users) {
        const randomPrompt = journalPrompts[Math.floor(Math.random() * journalPrompts.length)];
        
        emailService.sendDailyReminder(user, randomPrompt).catch(err => {
          console.error(`Failed to send reminder to ${user.email}:`, err);
        });
      }

    } catch (error) {
      console.error('Daily reminder cron error:', error);
    }
  });

  console.log('✅ Daily reminder cron job initialized');
};

// ═══════════════════════════════════════════════════════════
// 📊 WEEKLY SUMMARY CRON JOB
// Runs every Monday at 9 AM
// ═══════════════════════════════════════════════════════════
const setupWeeklySummary = () => {
  
  // Every Monday at 9:00 AM
  cron.schedule('0 9 * * 1', async () => {
    try {
      console.log('📊 Generating weekly summaries...');

      const Entry = require('../models/Entry');
      const Goal = require('../models/Goal');
      const PomodoroSession = require('../models/PomodoroSession');

      const users = await User.find({
        'settings.emailNotifications': true
      });

      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      for (const user of users) {
        try {
          // Calculate weekly stats
          const [entries, pomodoros, goals] = await Promise.all([
            Entry.find({
              user: user._id,
              createdAt: { $gte: weekAgo }
            }),
            PomodoroSession.countDocuments({
              user: user._id,
              completed: true,
              createdAt: { $gte: weekAgo }
            }),
            Goal.find({
              user: user._id,
              updatedAt: { $gte: weekAgo }
            })
          ]);

          // Calculate mood distribution
          const moodCounts = {};
          entries.forEach(entry => {
            moodCounts[entry.mood] = (moodCounts[entry.mood] || 0) + 1;
          });

          const topMoodKey = Object.keys(moodCounts).sort((a, b) => moodCounts[b] - moodCounts[a])[0];
          const moodEmojis = {
            amazing: '🤩', happy: '😊', neutral: '😐', sad: '😢',
            angry: '😠', anxious: '😰', stressed: '😓', excited: '🤗'
          };

          // Calculate XP earned
          const xpEarned = entries.reduce((sum, e) => sum + (e.xpAwarded || 0), 0);

          // Goals progress
          const goalsProgress = `${goals.filter(g => g.status === 'completed').length}/${goals.length}`;

          // Achievements
          const achievements = [];
          if (user.streak >= 7) achievements.push(`Maintained ${user.streak}-day streak!`);
          if (entries.length >= 5) achievements.push('Created 5+ journal entries');
          if (pomodoros >= 10) achievements.push('Completed 10+ pomodoro sessions');

          const weeklyData = {
            weekStart: weekAgo.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            weekEnd: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            entriesCount: entries.length,
            pomodoroCount: pomodoros,
            goalsProgress,
            xpEarned,
            topMood: {
              emoji: moodEmojis[topMoodKey] || '😊',
              label: topMoodKey || 'happy',
              count: moodCounts[topMoodKey] || 0
            },
            achievements
          };

          // Send email
          await emailService.sendWeeklySummaryEmail(user, weeklyData);

        } catch (err) {
          console.error(`Failed to send weekly summary to ${user.email}:`, err);
        }
      }

      console.log('✅ Weekly summaries sent');

    } catch (error) {
      console.error('Weekly summary cron error:', error);
    }
  });

  console.log('✅ Weekly summary cron job initialized');
};

module.exports = {
  setupDailyReminders,
  setupWeeklySummary
};