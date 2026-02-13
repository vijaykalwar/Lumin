import { FixedSizeList as List } from 'react-window';
import { memo } from 'react';
import { Link } from 'react-router-dom';
import { Target, TrendingUp } from 'lucide-react';

/**
 * Virtual scrolling wrapper for Goals list
 * Optimized for 100+ goals with smooth performance
 */

const GoalRow = memo(({ index, style, data }) => {
  const { goals, categoryColorMap } = data;
  const goal = goals[index];

  if (!goal) return null;

  const categories = {
    career: { icon: '💼', color: 'blue', label: 'Career' },
    health: { icon: '💪', color: 'green', label: 'Health' },
    learning: { icon: '📚', color: 'yellow', label: 'Learning' },
    finance: { icon: '💰', color: 'emerald', label: 'Finance' },
    relationships: { icon: '❤️', color: 'pink', label: 'Relationships' },
    hobbies: { icon: '🎨', color: 'purple', label: 'Hobbies' },
    other: { icon: '🎯', color: 'gray', label: 'Other' }
  };

  const categoryConfig = categories[goal.category] || categories.other;
  const progress = goal.targetValue > 0 
    ? Math.min(Math.round((goal.currentValue / goal.targetValue) * 100), 100)
    : 0;

  const priorityColors = {
    high: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
    medium: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
    low: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
  };

  const statusColors = {
    active: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    completed: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    paused: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
    abandoned: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
  };

  return (
    <div style={style} className="px-2">
      <Link
        to={`/goals/${goal._id}`}
        className="block bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 cursor-pointer h-full"
      >
        {/* Category Badge */}
        <div className="flex items-center justify-between mb-4">
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${categoryColorMap[categoryConfig.color] || categoryColorMap.gray}`}>
            <span>{categoryConfig.icon}</span>
            <span className="text-sm font-semibold">{categoryConfig.label}</span>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[goal.status] || statusColors.active}`}>
            {goal.status}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2 line-clamp-2">
          {goal.title}
        </h3>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              Progress
            </span>
            <span className="font-semibold text-purple-600 dark:text-purple-400">
              {progress}%
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>{goal.currentValue} {goal.unit}</span>
            <span>Target: {goal.targetValue} {goal.unit}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className={`px-2 py-1 rounded-full text-xs font-semibold ${priorityColors[goal.priority] || priorityColors.medium}`}>
            {goal.priority} priority
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Target className="w-3 h-3" />
            {new Date(goal.targetDate).toLocaleDateString()}
          </div>
        </div>
      </Link>
    </div>
  );
});

GoalRow.displayName = 'GoalRow';

export default function VirtualGoalList({ goals, containerHeight = 600 }) {
  const categoryColorMap = {
    blue: 'bg-blue-500/20 text-blue-400',
    green: 'bg-green-500/20 text-green-400',
    yellow: 'bg-yellow-500/20 text-yellow-400',
    emerald: 'bg-emerald-500/20 text-emerald-400',
    pink: 'bg-pink-500/20 text-pink-400',
    purple: 'bg-purple-500/20 text-purple-400',
    gray: 'bg-gray-500/20 text-gray-400'
  };

  const itemData = { goals, categoryColorMap };

  // Calculate item height based on screen size
  const getItemSize = () => {
    if (window.innerWidth >= 1024) return 260; // lg screens
    if (window.innerWidth >= 768) return 280;  // md screens
    return 300; // sm screens
  };

  const itemSize = getItemSize();

  return (
    <List
      height={containerHeight}
      itemCount={goals.length}
      itemSize={itemSize}
      itemData={itemData}
      width="100%"
      className="scrollbar-thin scrollbar-thumb-purple-500 scrollbar-track-gray-200 dark:scrollbar-track-gray-800"
    >
      {GoalRow}
    </List>
  );
}
