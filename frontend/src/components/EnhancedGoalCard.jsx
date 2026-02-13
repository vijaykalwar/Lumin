import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Plus, Edit2, Check, X, Calendar, TrendingUp } from 'lucide-react';

/**
 * Enhanced Goal Card with inline editing and progress predictions
 */
const EnhancedGoalCard = ({ goal, onUpdateProgress, isUpdating }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(goal.currentValue || 0);

  const target = goal.targetValue || 1;
  const current = goal.currentValue || 0;
  const progress = Math.min(Math.round((current / target) * 100), 100);

  // Calculate progress prediction
  const getPrediction = () => {
    if (!goal.createdAt || current === 0) return null;

    const daysSinceCreation = Math.max(1, Math.ceil((new Date() - new Date(goal.createdAt)) / (1000 * 60 * 60 * 24)));
    const ratePerDay = current / daysSinceCreation;
    
    if (ratePerDay === 0) return null;

    const remaining = target - current;
    const daysToComplete = Math.ceil(remaining / ratePerDay);

    const completionDate = new Date();
    completionDate.setDate(completionDate.getDate() + daysToComplete);

    return {
      daysToComplete,
      completionDate: completionDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      onTrack: goal.targetDate ? new Date(goal.targetDate) >= completionDate : true
    };
  };

  const prediction = getPrediction();

  const handleSave = () => {
    if (editValue !== current) {
      onUpdateProgress(goal._id, current, editValue - current);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(current);
    setIsEditing(false);
  };

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 transition-all">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0 flex-1">
          <h4 className="font-bold text-gray-900 dark:text-white text-sm truncate">{goal.title}</h4>
          
          {/* Progress with inline editing */}
          <div className="flex items-center gap-2 mt-1">
            {isEditing ? (
              <>
                <input
                  type="number"
                  value={editValue}
                  onChange={(e) => setEditValue(parseInt(e.target.value) || 0)}
                  className="w-16 px-2 py-1 text-xs border border-purple-300 dark:border-purple-700 rounded bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  disabled={isUpdating}
                />
                <span className="text-xs text-gray-500">/ {target} {goal.unit || 'units'}</span>
                <button
                  onClick={handleSave}
                  className="p-1 rounded hover:bg-green-100 dark:hover:bg-green-900/30 text-green-600"
                  disabled={isUpdating}
                >
                  <Check className="w-3 h-3" />
                </button>
                <button
                  onClick={handleCancel}
                  className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600"
                  disabled={isUpdating}
                >
                  <X className="w-3 h-3" />
                </button>
              </>
            ) : (
              <>
                <p className="text-xs text-gray-500">
                  {current} / {target} {goal.unit || 'units'}
                </p>
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1 rounded hover:bg-purple-100 dark:hover:bg-purple-900/30 text-purple-600"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Category badge */}
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 font-bold uppercase">
          {goal.category || 'general'}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-3">
        <div
          className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Prediction & Quick actions */}
      <div className="flex items-center justify-between mb-2">
        {prediction && (
          <div className="flex items-center gap-1 text-xs">
            <TrendingUp className={`w-3 h-3 ${prediction.onTrack ? 'text-green-500' : 'text-orange-500'}`} />
            <span className={prediction.onTrack ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}>
              Est: {prediction.completionDate}
            </span>
          </div>
        )}
        
        {goal.targetDate && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Calendar className="w-3 h-3" />
            <span>{new Date(goal.targetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-gray-500">Quick add:</span>
        {[1, 5, 10].map((add) => (
          <button
            key={add}
            type="button"
            disabled={isUpdating || isEditing}
            onClick={() => onUpdateProgress(goal._id, current, add)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-xs font-medium hover:bg-purple-200 dark:hover:bg-purple-800/50 disabled:opacity-50 transition-all"
          >
            <Plus className="w-3 h-3" />+{add}
          </button>
        ))}
        <Link
          to={`/goals/${goal._id}`}
          className="text-xs text-gray-500 hover:text-purple-600 flex items-center gap-1 ml-auto"
        >
          View <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      {/* Progress percentage badge */}
      <div className="mt-2 flex items-center justify-between">
        <span className={`text-xs font-bold ${progress >= 100 ? 'text-green-600 dark:text-green-400' : 'text-purple-600 dark:text-purple-400'}`}>
          {progress}% complete
        </span>
        {progress >= 80 && progress < 100 && (
          <span className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full font-medium">
            Almost there! 🎯
          </span>
        )}
        {progress >= 100 && (
          <span className="text-xs px-2 py-0.5 bg-green-600 text-white rounded-full font-medium">
            ✓ Complete
          </span>
        )}
      </div>
    </div>
  );
};

export default EnhancedGoalCard;
