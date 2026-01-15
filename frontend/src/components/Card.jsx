import React from 'react';

const Card = ({ 
  children, 
  variant = 'default',
  className = '',
  hoverable = false,
  onClick,
  ...props 
}) => {
  const baseStyles = 'rounded-xl transition-all duration-300';
  
  const variants = {
    // Standard card with surface color
    default: 'bg-card border border-border p-6',
    
    // Glass card with glassmorphism effect
    glass: 'glass-card p-6',
    
    // Stat card with hover effect
    stat: 'stat-card',
    
    // Gradient card
    gradient: 'bg-gradient-card border border-border/50 p-6',
    
    // Elevated card with shadow
    elevated: 'bg-card border border-border p-6 shadow-lg',
  };
  
  const hoverStyles = hoverable ? 'hover:-translate-y-1 hover:shadow-xl cursor-pointer' : '';
  const variantClass = variants[variant] || variants.default;
  
  return (
    <div
      className={`${baseStyles} ${variantClass} ${hoverStyles} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

// Stat Card Component
export const StatCard = ({ icon, label, value, trend, className = '' }) => {
  return (
    <Card variant="stat" className={className}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-muted-foreground mb-1">{label}</p>
          <p className="text-3xl font-display font-bold gradient-text">{value}</p>
          {trend && (
            <p className={`text-xs mt-2 ${trend > 0 ? 'text-neon-green' : 'text-destructive'}`}>
              {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
            </p>
          )}
        </div>
        {icon && (
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-primary">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
};

export default Card;
