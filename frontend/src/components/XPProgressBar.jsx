import React from 'react';

const XPProgressBar = ({ 
  currentXP, 
  requiredXP, 
  level,
  showLabel = true,
  className = '' 
}) => {
  const percentage = Math.min((currentXP / requiredXP) * 100, 100);
  
  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-foreground">
            Level {level} Progress
          </span>
          <span className="text-sm text-muted-foreground">
            {currentXP} / {requiredXP} XP
          </span>
        </div>
      )}
      <div className="xp-bar">
        <div 
          className="xp-bar-fill relative overflow-hidden"
          style={{ width: `${percentage}%` }}
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
        </div>
      </div>
      {showLabel && (
        <div className="mt-1 text-xs text-muted-foreground text-right">
          {percentage.toFixed(0)}% Complete
        </div>
      )}
    </div>
  );
};

export default XPProgressBar;
