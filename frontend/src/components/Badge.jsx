import React from 'react';

const Badge = ({ 
  children, 
  variant = 'default',
  size = 'md',
  icon,
  className = '' 
}) => {
  const variants = {
    default: 'bg-surface-2 text-foreground border border-border',
    primary: 'bg-primary text-primary-foreground',
    accent: 'bg-accent text-primary-foreground',
    success: 'bg-neon-green text-background',
    warning: 'bg-neon-orange text-background',
    danger: 'bg-destructive text-primary-foreground',
    purple: 'bg-neon-purple text-primary-foreground',
    pink: 'bg-neon-pink text-primary-foreground',
    cyan: 'bg-neon-cyan text-background',
    outline: 'bg-transparent border border-primary text-primary',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-1.5 text-base',
  };

  const variantClass = variants[variant] || variants.default;
  const sizeClass = sizes[size] || sizes.md;

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-medium ${variantClass} ${sizeClass} ${className}`}>
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </span>
  );
};

export default Badge;
