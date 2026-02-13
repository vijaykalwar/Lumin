import React from 'react';
import { Flame, Trophy, Zap } from 'lucide-react';
import { format, subDays } from 'date-fns';

/**
 * Streak Display Component
 * Large streak counter with icon, best streak, and mini calendar
 * 
 * @param {number} currentStreak - Current active streak
 * @param {number} bestStreak - Longest streak ever
 * @param {Array} weeklyActivity - Array of last 7 days activity
 * @param {string} size - 'lg' for large display
 */
const StreakDisplay = ({ 
  currentStreak = 0, 
  bestStreak = 0, 
  weeklyActivity = [],
  size = 'lg' 
}) => {
  // Determine icon and color based on streak
  const getStreakIcon = () => {
    if (currentStreak >= 30) {
      return { Icon: Trophy, color: 'text-yellow-500', bgColor: 'bg-yellow-500/20', label: 'Legendary!' };
    } else if (currentStreak >= 7) {
      return { Icon: Flame, color: 'text-orange-500', bgColor: 'bg-orange-500/20', label: 'On Fire!' };
    } else {
      return { Icon: Zap, color: 'text-cyan-500', bgColor: 'bg-cyan-500/20', label: 'Keep Going!' };
    }
  };

  const { Icon, color, bgColor, label } = getStreakIcon();

  // Ensure 7 days of data for mini calendar
  const ensureSevenDays = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const hasActivity = weeklyActivity.some(d => {
        const dataDate = new Date(d.date);
        return dataDate.toDateString() === date.toDateString() && 
               (d.journal_entries_count > 0 || d.focus_minutes > 0);
      });
      days.push({ date, hasActivity });
    }
    return days;
  };

  const weekDays = ensureSevenDays();

  return (
    <div className="card-glass p-6 space-y-6 animate-fadeIn">
      {/* Main Streak Display */}
      <div className="text-center">
        {/* Icon with Fire Glow Effect */}
        <div className="relative inline-block mb-4">
          <div className={`p-4 ${bgColor} rounded-2xl ${currentStreak >= 7 ? 'streak-fire' : ''}`}>
            <Icon className={`w-12 h-12 ${color}`} />
          </div>
          {currentStreak >= 7 && (
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-yellow-500 opacity-20 blur-md rounded-2xl -z-10" />
          )}
        </div>

        {/* Streak Number */}
        <div className={`text-5xl font-display font-bold ${color} mb-2`}>
          {currentStreak}
        </div>

        {/* Label */}
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
          day streak
        </div>

        {/* Status Label */}
        <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${bgColor} ${color}`}>
          {label}
        </div>
      </div>

      {/* Best Streak */}
      <div className="flex items-center justify-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-yellow-500" />
          <span className="text-sm text-gray-600 dark:text-gray-400">Best:</span>
        </div>
        <span className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
          {bestStreak}
        </span>
      </div>

      {/* Mini Calendar - This Week */}
      <div>
        <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-3 text-center">
          This Week
        </div>
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day, index) => {
            const dayLetter = format(day.date, 'EEEEEE'); // Single letter (M, T, W...)
            
            return (
              <div key={index} className="flex flex-col items-center gap-1">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {dayLetter}
                </span>
                <div
                  className={`w-8 h-8 rounded-lg transition-all ${
                    day.hasActivity
                      ? 'bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 shadow-md'
                      : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                  title={format(day.date, 'MMM d')}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default StreakDisplay;
