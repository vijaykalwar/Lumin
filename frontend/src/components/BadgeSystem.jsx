import React, { useState, useEffect } from 'react';
import { Trophy, Star, Flame, Target, Calendar, Zap, Award, Medal, Crown, Sparkles, Lock } from 'lucide-react';
import { celebrateBadge } from '../utils/celebrations';
import { showToast } from '../utils/toast';

/**
 * Badge definitions with unlock criteria
 */
export const BADGES = [
  {
    id: 'first-entry',
    name: 'First Step',
    icon: Star,
    color: 'from-blue-500 to-cyan-500',
    description: 'Created your first journal entry',
    requirement: 'Create 1 entry',
    checkUnlock: (stats) => stats.totalEntries >= 1
  },
  {
    id: 'fire-starter',
    name: 'Fire Starter',
    icon: Flame,
    color: 'from-orange-500 to-red-500',
    description: 'Maintained a 3-day streak',
    requirement: '3-day streak',
    checkUnlock: (stats) => stats.currentStreak >= 3
  },
  {
    id: 'week-warrior',
    name: 'Week Warrior',
    icon: Trophy,
    color: 'from-purple-500 to-pink-500',
    description: 'Maintained a 7-day streak',
    requirement: '7-day streak',
    checkUnlock: (stats) => stats.currentStreak >= 7
  },
  {
    id: 'consistent-writer',
    name: 'Consistent Writer',
    icon: Calendar,
    color: 'from-green-500 to-emerald-500',
    description: 'Wrote 10 journal entries',
    requirement: '10 entries',
    checkUnlock: (stats) => stats.totalEntries >= 10
  },
  {
    id: 'goal-setter',
    name: 'Goal Setter',
    icon: Target,
    color: 'from-indigo-500 to-blue-500',
    description: 'Created 5 goals',
    requirement: '5 goals',
    checkUnlock: (stats) => stats.totalGoals >= 5
  },
  {
    id: 'achiever',
    name: 'Achiever',
    icon: Medal,
    color: 'from-yellow-500 to-amber-500',
    description: 'Completed 3 goals',
    requirement: 'Complete 3 goals',
    checkUnlock: (stats) => stats.completedGoals >= 3
  },
  {
    id: 'month-master',
    name: 'Month Master',
    icon: Crown,
    color: 'from-pink-500 to-rose-500',
    description: 'Maintained a 30-day streak',
    requirement: '30-day streak',
    checkUnlock: (stats) => stats.currentStreak >= 30
  },
  {
    id: 'xp-collector',
    name: 'XP Collector',
    icon: Zap,
    color: 'from-yellow-400 to-orange-500',
    description: 'Earned 1000 XP',
    requirement: '1000 XP',
    checkUnlock: (stats) => stats.totalXP >= 1000
  },
  {
    id: 'prolific-author',
    name: 'Prolific Author',
    icon: Award,
    color: 'from-violet-500 to-purple-600',
    description: 'Wrote 50 journal entries',
    requirement: '50 entries',
    checkUnlock: (stats) => stats.totalEntries >= 50
  },
  {
    id: 'unstoppable',
    name: 'Unstoppable',  
    icon: Sparkles,
    color: 'from-cyan-400 to-blue-600',
    description: 'Maintained a 100-day streak',
    requirement: '100-day streak',
    checkUnlock: (stats) => stats.currentStreak >= 100
  }
];

/**
 * Single Badge Display Component
 */
export const BadgeItem = ({ badge, unlocked, progress = 0, onClick }) => {
  const Icon = badge.icon;

  return (
    <div
      onClick={onClick}
      className={`relative group cursor-pointer transition-all duration-300 ${
        unlocked
          ? 'hover:scale-110 hover:-translate-y-1'
          : 'opacity-60 hover:opacity-80'
      }`}
    >
      <div
        className={`p-4 rounded-xl flex flex-col items-center text-center ${
          unlocked
            ? `bg-gradient-to-br ${badge.color} text-white shadow-xl`
            : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
        }`}
      >
        <Icon className={`w-8 h-8 mb-2 ${unlocked ? 'animate-pulse' : ''}`} />
        <span className="text-xs font-bold">{badge.name}</span>
        
        {!unlocked && (
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <Lock className="w-6 h-6 text-gray-500" />
          </div>
        )}
      </div>

      {/* Tooltip */}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
        <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-xl">
          <p className="font-bold">{badge.name}</p>
          <p className="text-gray-300 mt-1">{badge.description}</p>
          <p className="text-gray-400 mt-1 text-[10px]">{badge.requirement}</p>
          {!unlocked && progress > 0 && (
            <div className="mt-2">
              <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
              <p className="text-gray-400 mt-1 text-[10px]">{Math.round(progress)}% complete</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/**
 * Badge Grid Display
 */
const BadgeSystem = ({ userStats, unlockedBadges = [] }) => {
  const [newlyUnlocked, setNewlyUnlocked] = useState([]);

  // Check for newly unlocked badges
  useEffect(() => {
    if (!userStats) return;

    const newUnlocks = [];
    
    BADGES.forEach(badge => {
      const alreadyUnlocked = unlockedBadges.some(b => b.name === badge.id);
      if (!alreadyUnlocked && badge.checkUnlock(userStats)) {
        newUnlocks.push(badge);
      }
    });

    if (newUnlocks.length > 0) {
      setNewlyUnlocked(newUnlocks);
      
      // Celebrate each new badge
      newUnlocks.forEach((badge, index) => {
        setTimeout(() => {
          celebrateBadge(badge.name);
          showToast.success(`🏆 Badge Unlocked: ${badge.name}!`);
        }, index * 1000);
      });
    }
  }, [userStats, unlockedBadges]);

  // Calculate progress for locked badges
  const getBadgeProgress = (badge) => {
    if (!userStats) return 0;

    switch (badge.id) {
      case 'first-entry':
      case 'consistent-writer':
      case 'prolific-author':
        const entryTarget = parseInt(badge.requirement);
        return (userStats.totalEntries / entryTarget) * 100;
      
      case 'fire-starter':
      case 'week-warrior':
      case 'month-master':
      case 'unstoppable':
        const streakTarget = parseInt(badge.requirement);
        return (userStats.currentStreak / streakTarget) * 100;
      
      case 'goal-setter':
        return (userStats.totalGoals / 5) * 100;
      
      case 'achiever':
        return (userStats.completedGoals / 3) * 100;
      
      case 'xp-collector':
        return (userStats.totalXP / 1000) * 100;
      
      default:
        return 0;
    }
  };

  const isBadgeUnlocked = (badge) => {
    return unlockedBadges.some(b => b.name === badge.id) || 
           newlyUnlocked.some(b => b.id === badge.id);
  };

  const unlockedCount = BADGES.filter(badge => isBadgeUnlocked(badge)).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Badges
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-900 dark:text-white">
            {unlockedCount}/{BADGES.length}
          </span>
          <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 transition-all duration-500"
              style={{ width: `${(unlockedCount / BADGES.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Badge Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
        {BADGES.map((badge) => (
          <BadgeItem
            key={badge.id}
            badge={badge}
            unlocked={isBadgeUnlocked(badge)}
            progress={getBadgeProgress(badge)}
          />
        ))}
      </div>

      {/* Recently Unlocked */}
      {newlyUnlocked.length > 0 && (
        <div className="mt-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800">
          <p className="text-sm font-bold text-yellow-900 dark:text-yellow-100 mb-2">
            🎉 Recently Unlocked!
          </p>
          <div className="flex flex-wrap gap-2">
            {newlyUnlocked.map((badge) => {
              const Icon = badge.icon;
              return (
                <div
                  key={badge.id}
                  className={`badge-unlock inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r ${badge.color} text-white text-xs font-bold`}
                >
                  <Icon className="w-4 h-4" />
                  {badge.name}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default BadgeSystem;
