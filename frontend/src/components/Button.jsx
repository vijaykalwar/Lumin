import React from 'react';

const Button = ({ 
  children, 
  variant = 'default', 
  size = 'md', 
  className = '', 
  disabled = false,
  onClick,
  type = 'button',
  ...props 
}) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variants = {
    // Default gaming button with gradient
    default: 'bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg hover:shadow-glow-purple hover:-translate-y-0.5 focus:ring-primary',
    
    // Gaming style with display font
    gaming: 'font-display tracking-wider uppercase bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg hover:shadow-glow-purple hover:-translate-y-0.5 focus:ring-primary',
    
    // Neon outline button
    neon: 'bg-transparent border-2 border-primary text-primary font-display tracking-wider uppercase hover:bg-primary hover:text-primary-foreground hover:shadow-glow-purple focus:ring-primary',
    
    // Fire gradient button
    fire: 'bg-gradient-to-r from-neon-orange to-neon-yellow text-foreground shadow-lg hover:shadow-[0_0_30px_hsl(25_95%_53%/0.6)] hover:-translate-y-0.5 focus:ring-neon-orange',
    
    // Success gradient button
    success: 'bg-gradient-to-r from-neon-green to-neon-cyan text-foreground shadow-lg hover:shadow-glow-cyan hover:-translate-y-0.5 focus:ring-neon-green',
    
    // Outline variant
    outline: 'border-2 border-border bg-transparent text-foreground hover:bg-surface-2 hover:border-primary focus:ring-primary',
    
    // Ghost variant
    ghost: 'bg-transparent text-foreground hover:bg-surface-2 focus:ring-primary',
    
    // Destructive variant
    destructive: 'bg-destructive text-primary-foreground shadow-lg hover:opacity-90 focus:ring-destructive',
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-base',
    lg: 'px-6 py-3 text-lg',
    xl: 'px-8 py-4 text-xl',
  };
  
  const variantClass = variants[variant] || variants.default;
  const sizeClass = sizes[size] || sizes.md;
  
  return (
    <button
      type={type}
      className={`${baseStyles} ${variantClass} ${sizeClass} ${className}`}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
