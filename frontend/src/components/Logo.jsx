import { Target, Zap } from 'lucide-react';
import { useState } from 'react';

function Logo({ size = "medium", showText = true, animated = true }) {
  const [isHovered, setIsHovered] = useState(false);
  
  const sizes = {
    small: { container: "w-10 h-10", icon: 20, text: "text-lg" },
    medium: { container: "w-14 h-14", icon: 28, text: "text-2xl" },
    large: { container: "w-20 h-20", icon: 40, text: "text-3xl" }
  };

  const current = sizes[size];

  return (
    <div 
      className="flex items-center space-x-3 group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 3D Logo Container */}
      <div className={`${current.container} relative`}>
        
        {/* Outer glow ring (animated) */}
        {animated && (
          <div className={`absolute inset-0 rounded-full bg-gradient-to-r from-primary-500 to-accent-500 opacity-50 blur-md ${isHovered ? 'animate-pulse' : ''}`}></div>
        )}
        
        {/* Middle ring */}
        <div className="absolute inset-1 rounded-full bg-gradient-to-br from-primary-600 to-accent-600 opacity-80"></div>
        
        {/* Main logo background */}
        <div className={`
          relative h-full w-full rounded-full 
          bg-gradient-to-br from-primary-500 via-accent-500 to-primary-600
          flex items-center justify-center
          shadow-2xl
          transition-all duration-300
          ${isHovered ? 'scale-110 rotate-12' : 'scale-100 rotate-0'}
        `}>
          {/* Icon with dual layer for depth */}
          <div className="relative">
            {/* Shadow icon */}
            <Target 
              size={current.icon} 
              className="text-primary-900 absolute top-0.5 left-0.5 opacity-30" 
              strokeWidth={2.5} 
            />
            {/* Main icon */}
            <Target 
              size={current.icon} 
              className="text-white relative z-10" 
              strokeWidth={2.5} 
            />
          </div>

          {/* Energy particles (animated) */}
          {animated && isHovered && (
            <>
              <Zap size={12} className="absolute -top-1 -right-1 text-yellow-400 animate-ping" />
              <Zap size={12} className="absolute -bottom-1 -left-1 text-pink-400 animate-ping" style={{ animationDelay: '150ms' }} />
            </>
          )}
        </div>

        {/* Level badge (gamification) */}
        {animated && (
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-slate-900 shadow-lg">
            5
          </div>
        )}
      </div>
      
      {/* Brand Text */}
      {showText && (
        <div className="flex flex-col">
          <span className={`
            ${current.text} font-bold leading-none
            bg-gradient-to-r from-primary-400 via-accent-400 to-primary-400 
            bg-clip-text text-transparent
            transition-all duration-300
            ${isHovered ? 'tracking-wider' : 'tracking-normal'}
          `}>
            LUMIN
          </span>
          {size === 'large' && (
            <span className="text-xs text-gray-400 font-medium mt-1">
              Growth Tracker
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default Logo;

/* ════════════════════════════════════════════════════════════
   🎨 LOGO FEATURES:
   ════════════════════════════════════════════════════════════
   
   1. 3D DEPTH EFFECT:
      - Multiple layered circles create depth
      - Shadow icon behind main icon
      - Gradient from primary to accent color
   
   2. ANIMATIONS:
      - Hover: Scale + Rotate effect
      - Pulse glow on outer ring
      - Energy particles (Zap icons) appear on hover
   
   3. GAMIFICATION:
      - Level badge in bottom-right corner
      - Shows current user level
      - Can be updated dynamically
   
   4. CUSTOMIZABLE:
      - size: "small", "medium", "large"
      - showText: true/false
      - animated: true/false
   
   5. USAGE:
      <Logo size="large" />
      <Logo size="small" showText={false} />
      <Logo animated={false} />
   
   ════════════════════════════════════════════════════════════ */