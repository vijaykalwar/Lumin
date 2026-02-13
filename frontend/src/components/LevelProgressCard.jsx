import React from 'react';
import { Zap } from 'lucide-react';

/**
 * Level Progress Card Component
 * Displays user's current level, XP progress with animated progress bar
 * 
 * XP Formula: Math.floor(100 * Math.pow(1.5, level - 1))
 * - Level 1: 100 XP
 * - Level 5: 506 XP
 * - Level 10: 3,844 XP
 */
const LevelProgressCard = ({ level = 1, currentXP = 0, totalXP = 0 }) => {
  // Calculate XP needed for current level
  const calculateXPForLevel = (lvl) => {
    return Math.floor(100 * Math.pow(1.5, lvl - 1));
  };

  // Calculate current level's XP requirement
  const currentLevelXP = calculateXPForLevel(level);
  const nextLevelXP = calculateXPForLevel(level + 1);
  
  // Calculate XP earned in current level
  const xpInCurrentLevel = currentXP - (totalXP - currentLevelXP);
  const xpNeededForLevel = nextLevelXP - currentLevelXP;
  const remainingXP = xpNeededForLevel - xpInCurrentLevel;
  
  // Calculate percentage for progress bar
  const progressPercentage = Math.min(
    (xpInCurrentLevel / xpNeededForLevel) * 100,
    100
  );

  return (
    <div className="card-glass p-6 space-y-4 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-yellow-500/20 rounded-xl">
            <Zap className="w-5 h-5 text-yellow-500" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            Level Progress
          </h3>
        </div>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {remainingXP.toLocaleString()} XP to next level
        </span>
      </div>

      {/* Level Badge + Info */}
      <div className="flex items-center gap-4">
        {/* Circular Level Badge */}
        <div className="flex-shrink-0">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 flex items-center justify-center shadow-lg">
            <span className="text-2xl font-bold text-white">{level}</span>
          </div>
        </div>

        {/* Level Info */}
        <div className="flex-1">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Level {level}
          </div>
          <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
            {xpInCurrentLevel.toLocaleString()} / {xpNeededForLevel.toLocaleString()} XP
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 rounded-full transition-all duration-500 ease-out progress-bar"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Footer Text */}
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>{progressPercentage.toFixed(1)}% complete</span>
          <span>{remainingXP.toLocaleString()} XP to Level {level + 1}</span>
        </div>
      </div>
    </div>
  );
};

export default LevelProgressCard;
