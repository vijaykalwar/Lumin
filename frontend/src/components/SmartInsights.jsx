import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, Lightbulb, Target, Flame, Zap, Trophy } from 'lucide-react';

/**
 * Smart Insights Widget - AI-powered productivity insights
 */
const SmartInsights = ({ weeklyActivity = [], streak = 0, goals = [], userData = {} }) => {
  
  const insights = useMemo(() => {
    const results = [];

    // 1. STREAK WARNING - High priority
    if (streak >= 3 && streak < 100) {
      const today = new Date().toDateString();
      const lastEntry = userData?.lastEntryDate ? new Date(userData.lastEntryDate).toDateString() : null;
      
      if (lastEntry !== today) {
        results.push({
          type: 'warning',
          icon: Flame,
          title: 'Streak at Risk!',
          message: `Your ${streak}-day streak ends today. Create an entry to keep it alive! 🔥`,
          priority: 10,
          color: 'from-orange-500 to-red-500'
        });
      }
    }

    // 2. STREAK MILESTONE APPROACHING
    const milestones = [7, 14, 30, 50, 100];
    const nextMilestone = milestones.find(m => m > streak);
    if (nextMilestone && (nextMilestone - streak) <= 2) {
      results.push({
        type: 'motivation',
        icon: Trophy,
        title: 'Milestone Approaching!',
        message: `Only ${nextMilestone - streak} more days to reach ${nextMilestone}-day streak milestone! 🏆`,
        priority: 8,
        color: 'from-purple-500 to-pink-500'
      });
    }

    // 3. PRODUCTIVITY PATTERN ANALYSIS
    if (weeklyActivity.length >= 5) {
      const sorted = [...weeklyActivity].sort((a, b) => (b.entries || 0) - (a.entries || 0));
      const bestDay = sorted[0];
      
      if (bestDay && bestDay.entries > 0) {
        results.push({
          type: 'insight',
          icon: TrendingUp,
          title: 'Peak Productivity',
          message: `You're most productive on ${bestDay.date || 'weekdays'}! Schedule important tasks then. 📈`,
          priority: 6,
          color: 'from-blue-500 to-cyan-500'
        });
      }
    }

    // 4. GOAL PROGRESS INSIGHTS
    if (goals.length > 0) {
      const strugglingGoals = goals.filter(g => {
        const progress = (g.currentValue / g.targetValue) * 100;
        const daysLeft = g.targetDate ? Math.ceil((new Date(g.targetDate) - new Date()) / (1000 * 60 * 60 * 24)) : 0;
        return progress < 30 && daysLeft < 7 && daysLeft > 0;
      });

      if (strugglingGoals.length > 0) {
        results.push({
          type: 'alert',
          icon: AlertTriangle,
          title: 'Goals Need Attention',
          message: `${strugglingGoals.length} goal${strugglingGoals.length > 1 ? 's' : ''} behind schedule. Focus on small wins today! 🎯`,
          priority: 7,
          color: 'from-yellow-500 to-orange-500'
        });
      }

      const nearComplete = goals.filter(g => (g.currentValue / g.targetValue) * 100 >= 80);
      if (nearComplete.length > 0) {
        results.push({
          type: 'motivation',
          icon: Zap,
          title: 'Almost There!',
          message: `${nearComplete.length} goal${nearComplete.length > 1 ? 's are' : ' is'} 80%+ complete. Finish strong! 💪`,
          priority: 7,
          color: 'from-green-500 to-emerald-500'
        });
      }
    }

    // 5. ACTIVITY TREND
    if (weeklyActivity.length >= 7) {
      const recentHalf = weeklyActivity.slice(-3);
      const olderHalf = weeklyActivity.slice(0, 4);
      
      const recentAvg = recentHalf.reduce((sum, day) => sum + (day.entries || 0), 0) / recentHalf.length;
      const olderAvg = olderHalf.reduce((sum, day) => sum + (day.entries || 0), 0) / olderHalf.length;

      if (recentAvg > olderAvg * 1.3) {
        results.push({
          type: 'positive',
          icon: TrendingUp,
          title: 'Momentum Building!',
          message: 'Your activity is increasing. Keep up the great work! 🚀',
          priority: 5,
          color: 'from-indigo-500 to-purple-500'
        });
      } else if (recentAvg < olderAvg * 0.7) {
        results.push({
          type: 'alert',
          icon: TrendingDown,
          title: 'Activity Declining',
          message: 'Your entries are decreasing. Take a small step today to rebuild momentum. 💪',
          priority: 6,
          color: 'from-pink-500 to-rose-500'
        });
      }
    }

    // 6. SUGGESTIONS FOR NEW GOALS
    if (goals.length === 0) {
      results.push({
        type: 'suggestion',
        icon: Target,
        title: 'Set Your First Goal',
        message: 'Goals give direction to your journey. Start with something simple! 🎯',
        priority: 4,
        color: 'from-teal-500 to-cyan-500'
      });
    } else if (goals.filter(g => g.status === 'active').length === 0) {
      results.push({
        type: 'suggestion',
        icon: Target,
        title: 'Create New Goals',
        message: 'All goals complete! Set new challenges to keep growing. 🌱',
        priority: 5,
        color: 'from-violet-500 to-purple-500'
      });
    }

    // 7. LEVEL UP MOTIVATION
    if (userData?.xp && userData?.level) {
      const xpForCurrentLevel = (userData.level - 1) * 150;
      const xpForNextLevel = userData.level * 150;
      const xpProgress = ((userData.xp - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100;

      if (xpProgress >= 80) {
        results.push({
          type: 'motivation',
          icon: Zap,
          title: 'Level Up Soon!',
          message: `You're ${Math.round(100 - xpProgress)}% away from Level ${userData.level + 1}! ⚡`,
          priority: 6,
          color: 'from-yellow-400 to-orange-500'
        });
      }
    }

    // Sort by priority (higher first) and return top 3
    return results.sort((a, b) => b.priority - a.priority).slice(0, 3);
  }, [weeklyActivity, streak, goals, userData]);

  if (insights.length === 0) {
    return (
      <div className="card-glass animate-fadeIn p-6 text-center">
        <Lightbulb className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Keep logging to unlock insights! 📊
        </p>
      </div>
    );
  }

  return (
    <div className="card-glass animate-fadeIn">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2" style={{ fontFamily: 'Orbitron, sans-serif' }}>
          <Lightbulb className="w-5 h-5 text-purple-500" />
          Smart Insights
        </h3>
        <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full font-bold">
          AI
        </span>
      </div>

      <div className="space-y-3">
        {insights.map((insight, index) => {
          const Icon = insight.icon;
          return (
            <div
              key={index}
              className={`p-3 rounded-xl bg-gradient-to-r ${insight.color} text-white transform transition-all hover:scale-[1.02]`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm mb-1">{insight.title}</h4>
                  <p className="text-xs text-white/90">{insight.message}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SmartInsights;
