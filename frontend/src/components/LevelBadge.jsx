import React from 'react';

const LevelBadge = ({ 
  level, 
  size = 'md',
  showLabel = false,
  className = '' 
}) => {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-20 h-20 text-2xl',
  };
  
  const sizeClass = sizes[size] || sizes.md;
  
  return (
    <div className={`inline-flex flex-col items-center gap-1 ${className}`}>
      <div className={`level-badge rounded-full ${sizeClass} font-display font-bold text-primary-foreground animate-glow-pulse`}>
        {level}
      </div>
      {showLabel && (
        <span className="text-xs text-muted-foreground font-medium">Level</span>
      )}
    </div>
  );
};

export default LevelBadge;
