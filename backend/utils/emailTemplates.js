// ═══════════════════════════════════════════════════════════
// 📧 EMAIL TEMPLATES
// ═══════════════════════════════════════════════════════════

const getEmailTemplate = (type, data) => {
  const templates = {
    
    // Welcome Email
    welcome: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); padding: 40px 20px; text-align: center; color: white; }
            .header h1 { margin: 0; font-size: 32px; }
            .content { padding: 40px 30px; }
            .content h2 { color: #333; margin-bottom: 20px; }
            .content p { color: #666; line-height: 1.6; margin-bottom: 15px; }
            .button { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px; }
            .features { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 30px 0; }
            .feature { padding: 20px; background: #f9fafb; border-radius: 12px; text-align: center; }
            .feature-icon { font-size: 32px; margin-bottom: 10px; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; color: #999; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🌟 Welcome to LUMIN!</h1>
            </div>
            <div class="content">
              <h2>Hi ${data.name}! 👋</h2>
              <p>We're thrilled to have you join the LUMIN community! You've just taken the first step towards a more mindful and productive life.</p>
              
              <p><strong>Here's what you can do with LUMIN:</strong></p>
              
              <div class="features">
                <div class="feature">
                  <div class="feature-icon">📔</div>
                  <strong>Daily Journaling</strong>
                  <p style="font-size: 14px; color: #666; margin-top: 8px;">Track your mood and thoughts</p>
                </div>
                <div class="feature">
                  <div class="feature-icon">🎯</div>
                  <strong>SMART Goals</strong>
                  <p style="font-size: 14px; color: #666; margin-top: 8px;">Set and achieve your dreams</p>
                </div>
                <div class="feature">
                  <div class="feature-icon">⏱️</div>
                  <strong>Pomodoro Timer</strong>
                  <p style="font-size: 14px; color: #666; margin-top: 8px;">Boost your productivity</p>
                </div>
                <div class="feature">
                  <div class="feature-icon">🤖</div>
                  <strong>AI Assistant</strong>
                  <p style="font-size: 14px; color: #666; margin-top: 8px;">Get personalized guidance</p>
                </div>
              </div>

              <p>Ready to start your journey? Click the button below to create your first journal entry!</p>
              
              <a href="${process.env.FRONTEND_URL}/add-entry" class="button">Create First Entry</a>
              
              <p style="margin-top: 30px; font-size: 14px; color: #999;">
                Pro tip: Consistency is key! Try to journal daily to build your streak 🔥
              </p>
            </div>
            <div class="footer">
              <p>You're receiving this email because you signed up for LUMIN.</p>
              <p>© 2025 LUMIN. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,

    // Daily Reminder
    dailyReminder: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); padding: 30px 20px; text-align: center; color: white; }
            .content { padding: 40px 30px; }
            .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin: 25px 0; }
            .stat { padding: 15px; background: #f9fafb; border-radius: 12px; text-align: center; }
            .stat-value { font-size: 24px; font-weight: bold; color: #8b5cf6; }
            .stat-label { font-size: 12px; color: #666; margin-top: 5px; }
            .button { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; color: #999; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⏰ Time to Reflect!</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Your daily journal reminder</p>
            </div>
            <div class="content">
              <h2>Hi ${data.name}! 👋</h2>
              <p>It's time for your daily reflection. Take a moment to capture your thoughts and feelings today.</p>
              
              <div class="stats">
                <div class="stat">
                  <div class="stat-value">${data.streak}</div>
                  <div class="stat-label">Day Streak 🔥</div>
                </div>
                <div class="stat">
                  <div class="stat-value">${data.level}</div>
                  <div class="stat-label">Level ⭐</div>
                </div>
                <div class="stat">
                  <div class="stat-value">${data.xp}</div>
                  <div class="stat-label">Total XP 💪</div>
                </div>
              </div>

              <p><strong>Today's prompt:</strong></p>
              <p style="padding: 20px; background: #f9fafb; border-left: 4px solid #8b5cf6; border-radius: 8px; font-style: italic;">
                "${data.prompt || 'What made you smile today? What challenged you?'}"
              </p>
              
              <a href="${process.env.FRONTEND_URL}/add-entry" class="button">Start Writing</a>
              
              <p style="margin-top: 30px; font-size: 14px; color: #999;">
                Don't break your streak! Keep the momentum going! 💫
              </p>
            </div>
            <div class="footer">
              <p>Want to change your reminder time? <a href="${process.env.FRONTEND_URL}/profile" style="color: #8b5cf6;">Update Settings</a></p>
              <p>© 2025 LUMIN. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,

    // Goal Completed
    goalCompleted: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 40px 20px; text-align: center; color: white; }
            .celebration { font-size: 64px; margin-bottom: 10px; }
            .content { padding: 40px 30px; }
            .goal-box { padding: 20px; background: #f0fdf4; border: 2px solid #10b981; border-radius: 12px; margin: 20px 0; }
            .reward { padding: 20px; background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); border-radius: 12px; color: white; text-align: center; margin: 20px 0; }
            .button { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; color: #999; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="celebration">🎉</div>
              <h1>Goal Completed!</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">You did it, champion!</p>
            </div>
            <div class="content">
              <h2>Congratulations, ${data.name}! 🏆</h2>
              <p>You've successfully completed your goal! This is a huge achievement, and you should be incredibly proud of yourself.</p>
              
              <div class="goal-box">
                <h3 style="color: #10b981; margin: 0 0 10px 0;">✓ ${data.goalTitle}</h3>
                <p style="color: #666; margin: 0;">${data.goalDescription || 'Another milestone reached!'}</p>
              </div>

              <div class="reward">
                <h3 style="margin: 0 0 10px 0;">🎁 Rewards Earned</h3>
                <div style="display: flex; justify-content: center; gap: 30px; margin-top: 15px;">
                  <div>
                    <div style="font-size: 24px; font-weight: bold;">+${data.xpReward}</div>
                    <div style="font-size: 14px; opacity: 0.9;">XP Points</div>
                  </div>
                  ${data.badge ? `
                    <div>
                      <div style="font-size: 24px; font-weight: bold;">🏅</div>
                      <div style="font-size: 14px; opacity: 0.9;">${data.badge}</div>
                    </div>
                  ` : ''}
                </div>
              </div>

              <p><strong>What's next?</strong></p>
              <p>Keep the momentum going! Set your next goal and continue your journey to greatness.</p>
              
              <a href="${process.env.FRONTEND_URL}/create-goal" class="button">Set New Goal</a>
              
              <p style="margin-top: 30px; font-size: 14px; color: #999;">
                "Success is the sum of small efforts repeated day in and day out." - Robert Collier
              </p>
            </div>
            <div class="footer">
              <p>Keep crushing your goals! You're doing amazing! 💪</p>
              <p>© 2025 LUMIN. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,

    // Streak Milestone
    streakMilestone: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 40px 20px; text-align: center; color: white; }
            .fire { font-size: 80px; margin-bottom: 10px; animation: bounce 1s infinite; }
            @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
            .content { padding: 40px 30px; }
            .milestone-box { padding: 30px; background: linear-gradient(135deg, #fed7aa 0%, #fdba74 100%); border-radius: 12px; text-align: center; margin: 20px 0; }
            .milestone-number { font-size: 72px; font-weight: bold; color: #ea580c; }
            .button { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; color: #999; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="fire">🔥</div>
              <h1>Streak Milestone!</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">You're on fire!</p>
            </div>
            <div class="content">
              <h2>Incredible Work, ${data.name}! 🎊</h2>
              <p>You've reached an amazing milestone! Your consistency and dedication are truly inspiring.</p>
              
              <div class="milestone-box">
                <div class="milestone-number">${data.streak}</div>
                <h3 style="margin: 10px 0; color: #ea580c;">Days in a Row! 🔥</h3>
                <p style="margin: 0; color: #9a3412;">Keep the streak alive!</p>
              </div>

              <p><strong>Why streaks matter:</strong></p>
              <ul style="color: #666; line-height: 1.8;">
                <li>✅ Builds consistent habits</li>
                <li>✅ Increases self-awareness</li>
                <li>✅ Boosts mental clarity</li>
                <li>✅ Tracks your growth journey</li>
              </ul>
              
              <p>Don't break the chain! Your next entry is waiting for you.</p>
              
              <a href="${process.env.FRONTEND_URL}/add-entry" class="button">Continue Streak</a>
              
              <p style="margin-top: 30px; font-size: 14px; color: #999;">
                ${data.bonusXP ? `🎁 Bonus: You earned +${data.bonusXP} XP for this milestone!` : ''}
              </p>
            </div>
            <div class="footer">
              <p>You're unstoppable! Keep going! 🚀</p>
              <p>© 2025 LUMIN. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,

    // Weekly Summary
    weeklySummary: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background-color: #f5f5f5; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 40px 20px; text-align: center; color: white; }
            .content { padding: 40px 30px; }
            .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 25px 0; }
            .stat-card { padding: 20px; background: #f9fafb; border-radius: 12px; text-align: center; }
            .stat-value { font-size: 32px; font-weight: bold; color: #3b82f6; }
            .stat-label { font-size: 14px; color: #666; margin-top: 5px; }
            .mood-chart { padding: 20px; background: #f0f9ff; border-radius: 12px; margin: 20px 0; }
            .button { display: inline-block; padding: 14px 32px; background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px; }
            .footer { background: #f9fafb; padding: 20px; text-align: center; color: #999; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📊 Your Week in Review</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">${data.weekStart} - ${data.weekEnd}</p>
            </div>
            <div class="content">
              <h2>Hi ${data.name}! 👋</h2>
              <p>Here's a summary of your progress this week. You're doing great!</p>
              
              <div class="stats-grid">
                <div class="stat-card">
                  <div class="stat-value">${data.entriesCount}</div>
                  <div class="stat-label">📝 Entries Created</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">${data.pomodoroCount}</div>
                  <div class="stat-label">⏱️ Pomodoro Sessions</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">${data.goalsProgress}</div>
                  <div class="stat-label">🎯 Goals Progress</div>
                </div>
                <div class="stat-card">
                  <div class="stat-value">+${data.xpEarned}</div>
                  <div class="stat-label">⭐ XP Earned</div>
                </div>
              </div>

              <div class="mood-chart">
                <h3 style="color: #3b82f6; margin: 0 0 15px 0;">😊 Most Common Mood</h3>
                <div style="font-size: 48px; text-align: center; margin: 20px 0;">
                  ${data.topMood?.emoji || '😊'}
                </div>
                <p style="text-align: center; color: #666; margin: 0;">
                  ${data.topMood?.label || 'Happy'} - ${data.topMood?.count || 0} times
                </p>
              </div>

              ${data.achievements?.length > 0 ? `
                <div style="padding: 20px; background: #fef3c7; border-radius: 12px; margin: 20px 0;">
                  <h3 style="color: #d97706; margin: 0 0 15px 0;">🏆 This Week's Achievements</h3>
                  <ul style="margin: 0; padding-left: 20px; color: #92400e;">
                    ${data.achievements.map(a => `<li>${a}</li>`).join('')}
                  </ul>
                </div>
              ` : ''}

              <p><strong>Keep up the momentum!</strong></p>
              <p>Next week, let's aim even higher. Your journey to self-improvement continues!</p>
              
              <a href="${process.env.FRONTEND_URL}/analytics" class="button">View Full Analytics</a>
              
              <p style="margin-top: 30px; font-size: 14px; color: #999;">
                "The secret of getting ahead is getting started." - Mark Twain
              </p>
            </div>
            <div class="footer">
              <p>Have a fantastic week ahead! 🌟</p>
              <p>© 2025 LUMIN. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `

  };

  return templates[type] || '';
};

module.exports = { getEmailTemplate };