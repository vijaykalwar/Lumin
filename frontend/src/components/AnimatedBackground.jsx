import React from 'react';

const AnimatedBackground = ({ variant = 'default', children }) => {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Base gradient background */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#0a0d14] via-[#0e1117] to-[#0a0d14]" />
      
      {/* Animated gradient orbs - reduced opacity */}
      <div className="fixed inset-0 opacity-10">
        {/* Purple orb */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary rounded-full blur-[120px] animate-float" 
             style={{ animationDelay: '0s', animationDuration: '12s' }} />
        
        {/* Pink orb */}
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent rounded-full blur-[120px] animate-float" 
             style={{ animationDelay: '4s', animationDuration: '15s' }} />
      </div>

      {/* Grid pattern overlay - very subtle */}
      <div className="fixed inset-0 grid-pattern opacity-5" />

      {/* Reduced particles - only 8 instead of 20 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-10"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${8 + Math.random() * 8}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default AnimatedBackground;
