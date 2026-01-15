import React from 'react';

const StreakFire = ({ 
  streak, 
  size = 'md',
  showCount = true,
  className = '' 
}) => {
  const sizes = {
    sm: 'text-xl',
    md: 'text-3xl',
    lg: 'text-5xl',
    xl: 'text-7xl',
  };
  
  const sizeClass = sizes[size] || sizes.md;
  
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <div className={`streak-fire ${sizeClass}`}>
        🔥
      </div>
      {showCount && (
        <div className="flex flex-col">
          <span className="text-2xl font-display font-bold gradient-text">
            {streak}
          </span>
          <span className="text-xs text-muted-foreground uppercase tracking-wide">
            Day Streak
          </span>
        </div>
      )}
    </div>
  );
};

export default StreakFire;
