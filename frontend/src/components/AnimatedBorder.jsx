import React from 'react';

const AnimatedBorder = ({ 
  children, 
  className = '',
  speed = 'normal',
  ...props 
}) => {
  const speeds = {
    slow: 'animate-[border-flow_6s_linear_infinite]',
    normal: 'animate-border-flow',
    fast: 'animate-[border-flow_2s_linear_infinite]',
  };
  
  const speedClass = speeds[speed] || speeds.normal;
  
  return (
    <div className={`animated-border ${speedClass} ${className}`} {...props}>
      <div className="glass-card h-full">
        {children}
      </div>
    </div>
  );
};

export default AnimatedBorder;
