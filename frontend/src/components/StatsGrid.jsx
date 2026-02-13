import React from 'react';
import { Flame, BookOpen, Timer, Target, TrendingUp, TrendingDown } from 'lucide-react';

/**
 * Stats Grid Component
 * Displays 4 stat cards with colored neon glow hover effects
 */
const StatsGrid = ({ 
  currentStreak = 0, 
  totalEntries = 0, 
  focusSessions = 0, 
  focusHours = 0,
  trends = {} // { streak: +5, entries: -2, sessions: +10, hours: +3 }
}) => {
  const stats = [
    {
      icon: Flame,
      value: currentStreak,
      subtitle: 'days',
      label: 'Current Streak',
      color: 'orange',
      bgColor: 'bg-orange-500/20',
      textColor: 'text-orange-500',
      hoverShadow: 'hover:shadow-[0_0_20px_rgba(251,146,60,0.3)]',
      trend: trends.streak
    },
    {
      icon: BookOpen,
      value: totalEntries,
      subtitle: 'entries',
      label: 'Total Entries',
      color: 'purple',
      bgColor: 'bg-purple-500/20',
      textColor: 'text-purple-500',
      hoverShadow: 'hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]',
      trend: trends.entries
    },
    {
      icon: Timer,
      value: focusSessions,
      subtitle: 'completed',
      label: 'Focus Sessions',
      color: 'cyan',
      bgColor: 'bg-cyan-500/20',
      textColor: 'text-cyan-500',
      hoverShadow: 'hover:shadow-[0_0_20px_rgba(6,182,212,0.3)]',
      trend: trends.sessions
    },
    {
      icon: Target,
      value: focusHours,
      subtitle: 'hours',
      label: 'Focus Time',
      color: 'green',
      bgColor: 'bg-green-500/20',
      textColor: 'text-green-500',
      hoverShadow: 'hover:shadow-[0_0_20px_rgba(34,197,94,0.3)]',
      trend: trends.hours
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
};

/**
 * Individual Stat Card
 */
const StatCard = ({ 
  icon: Icon, 
  value, 
  subtitle, 
  label, 
  bgColor, 
  textColor, 
  hoverShadow,
  trend 
}) => {
  return (
    <div className={`card-glass p-5 stat-card cursor-default transition-all duration-300 ${hoverShadow}`}>
      {/* Header with Icon and Trend */}
      <div className="flex justify-between items-start mb-3">
        <div className={`p-2 ${bgColor} rounded-xl`}>
          <Icon className={`w-5 h-5 ${textColor}`} />
        </div>
        
        {/* Trend Badge */}
        {trend && trend !== 0 && (
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
            trend > 0 
              ? 'bg-green-500/20 text-green-600 dark:text-green-400' 
              : 'bg-red-500/20 text-red-600 dark:text-red-400'
          }`}>
            {trend > 0 ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>

      {/* Value */}
      <div className="text-2xl font-display font-bold text-gray-900 dark:text-white mb-1">
        {value.toLocaleString()}
      </div>

      {/* Subtitle */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        {subtitle}
      </div>

      {/* Label (hidden on small screens) */}
      <div className="text-xs text-gray-500 dark:text-gray-500 mt-1 hidden md:block">
        {label}
      </div>
    </div>
  );
};

export default StatsGrid;
