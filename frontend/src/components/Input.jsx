import React from 'react';

const Input = ({ 
  label, 
  error, 
  className = '', 
  type = 'text',
  variant = 'default',
  icon,
  ...props 
}) => {
  const baseStyles = 'w-full px-4 py-3 bg-surface-2 text-foreground border rounded-lg transition-all duration-200 placeholder:text-muted-foreground focus:outline-none';
  
  const variants = {
    default: 'border-surface-3 focus:ring-2 focus:ring-primary focus:border-transparent',
    gaming: 'border-surface-3 focus:ring-2 focus:ring-primary focus:border-transparent font-body',
    neon: 'border-primary/50 focus:ring-2 focus:ring-primary focus:border-primary focus:shadow-glow-purple',
    success: 'border-neon-green/50 focus:ring-2 focus:ring-neon-green focus:border-neon-green focus:shadow-glow-cyan',
    error: 'border-destructive focus:ring-2 focus:ring-destructive focus:border-destructive',
  };
  
  const variantClass = error ? variants.error : (variants[variant] || variants.default);
  
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-foreground mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {icon}
          </div>
        )}
        <input
          type={type}
          className={`${baseStyles} ${variantClass} ${icon ? 'pl-10' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-destructive">{error}</p>
      )}
    </div>
  );
};

export default Input;
