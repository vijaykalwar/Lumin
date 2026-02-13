const createTransporter = require('../config/email');
const { getEmailTemplate } = require('../utils/emailTemplates');

class EmailService {
  
  // ═══════════════════════════════════════════════════════════
  // 📧 SEND EMAIL - Core function
  // ═══════════════════════════════════════════════════════════
  async sendEmail(to, subject, html) {
    try {
      const transporter = createTransporter();
      
      const mailOptions = {
        from: `"LUMIN App" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('✅ Email sent:', info.messageId);
      return { success: true, messageId: info.messageId };
      
    } catch (error) {
      console.error('❌ Email send error:', error);
      return { success: false, error: error.message };
    }
  }

  // ═══════════════════════════════════════════════════════════
  // 👋 WELCOME EMAIL
  // ═══════════════════════════════════════════════════════════
  async sendWelcomeEmail(user) {
    const html = getEmailTemplate('welcome', {
      name: user.name
    });

    return await this.sendEmail(
      user.email,
      '🌟 Welcome to LUMIN - Start Your Journey!',
      html
    );
  }

  // ═══════════════════════════════════════════════════════════
  // ⏰ DAILY REMINDER
  // ═══════════════════════════════════════════════════════════
  async sendDailyReminder(user, prompt = null) {
    const html = getEmailTemplate('dailyReminder', {
      name: user.name,
      streak: user.streak,
      level: user.level,
      xp: user.xp,
      prompt
    });

    return await this.sendEmail(
      user.email,
      '⏰ Time for Your Daily Reflection',
      html
    );
  }

  // ═══════════════════════════════════════════════════════════
  // 🎯 GOAL COMPLETED
  // ═══════════════════════════════════════════════════════════
  async sendGoalCompletedEmail(user, goal) {
    const html = getEmailTemplate('goalCompleted', {
      name: user.name,
      goalTitle: goal.title,
      goalDescription: goal.description,
      xpReward: goal.xpReward,
      badge: goal.badgeAwarded
    });

    return await this.sendEmail(
      user.email,
      '🎉 Goal Completed - You Did It!',
      html
    );
  }

  // ═══════════════════════════════════════════════════════════
  // 🔥 STREAK MILESTONE
  // ═══════════════════════════════════════════════════════════
  async sendStreakMilestoneEmail(user, bonusXP = 0) {
    const html = getEmailTemplate('streakMilestone', {
      name: user.name,
      streak: user.streak,
      bonusXP
    });

    return await this.sendEmail(
      user.email,
      `🔥 ${user.streak} Day Streak! - You're On Fire!`,
      html
    );
  }

  // ═══════════════════════════════════════════════════════════
  // 📊 WEEKLY SUMMARY
  // ═══════════════════════════════════════════════════════════
  async sendWeeklySummaryEmail(user, weeklyData) {
    const html = getEmailTemplate('weeklySummary', {
      name: user.name,
      weekStart: weeklyData.weekStart,
      weekEnd: weeklyData.weekEnd,
      entriesCount: weeklyData.entriesCount,
      pomodoroCount: weeklyData.pomodoroCount,
      goalsProgress: weeklyData.goalsProgress,
      xpEarned: weeklyData.xpEarned,
      topMood: weeklyData.topMood,
      achievements: weeklyData.achievements
    });

    return await this.sendEmail(
      user.email,
      `📊 Your Week in Review - ${weeklyData.weekStart} to ${weeklyData.weekEnd}`,
      html
    );
  }

  // ═══════════════════════════════════════════════════════════
  // 🔐 PASSWORD RESET
  // ═══════════════════════════════════════════════════════════
  async sendPasswordResetEmail(user, resetUrl) {
    const html = getEmailTemplate('passwordReset', {
      name: user.name,
      resetUrl,
      expiresIn: '1 hour'
    });

    return await this.sendEmail(
      user.email,
      '🔐 Reset Your LUMIN Password',
      html
    );
  }

  // ═══════════════════════════════════════════════════════════
  // ✅ PASSWORD CHANGED CONFIRMATION
  // ═══════════════════════════════════════════════════════════
  async sendPasswordChangedEmail(user) {
    const html = getEmailTemplate('passwordChanged', {
      name: user.name
    });

    return await this.sendEmail(
      user.email,
      '✅ Your LUMIN Password Was Changed',
      html
    );
  }

}

module.exports = new EmailService();