
// 🎨 LUMIN THEME CONFIGURATION
// ════════════════════════════════════════════════════════════
// Change colors, fonts, spacing easily from this ONE file!
// ════════════════════════════════════════════════════════════

export const theme = {
  // ========== COLORS (HEX) ==========
  // Main brand colors
  colors: {
    primary: {
      main: '#a855f7',      // Purple - Main brand color
      light: '#c084fc',     // Light purple - Hover states
      dark: '#7e22ce',      // Dark purple - Active states
      gradient: 'from-primary-500 to-accent-500'
    },
    accent: {
      main: '#ec4899',      // Pink - Accent/CTA
      light: '#f472b6',     
      dark: '#be185d',
      gradient: 'from-accent-500 to-primary-500'
    },
    background: {
      dark: '#0f172a',      // Main dark background
      card: '#1e293b',      // Card background
      hover: '#334155'      // Hover state
    },
    text: {
      primary: '#ffffff',   // Main text
      secondary: '#cbd5e1', // Secondary text
      muted: '#94a3b8'      // Muted text
    },
    gamification: {
      xp: '#fbbf24',        // Yellow - XP points
      level: '#8b5cf6',     // Purple - Level
      streak: '#f97316',    // Orange - Streak fire
      badge: '#10b981'      // Green - Badges
    }
  },

  // ========== LAYOUT ==========
  layout: {
    maxWidth: '1280px',     // Max container width
    padding: {
      mobile: '1rem',       // 16px
      tablet: '1.5rem',     // 24px
      desktop: '2rem'       // 32px
    },
    borderRadius: {
      small: '0.5rem',      // 8px - Buttons
      medium: '0.75rem',    // 12px - Cards
      large: '1rem'         // 16px - Modals
    }
  },

  // ========== TYPOGRAPHY ==========
  fonts: {
    primary: "'Inter', system-ui, sans-serif",
    heading: "'Poppins', 'Inter', sans-serif",
    mono: "'Fira Code', monospace"
  },

  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '1.875rem',// 30px
    '4xl': '2.25rem', // 36px
    '5xl': '3rem'     // 48px
  },

  // ========== SHADOWS ==========
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
    glow: '0 0 20px rgba(168, 85, 247, 0.4)',
    glowPink: '0 0 20px rgba(236, 72, 153, 0.4)'
  },

  // ========== ANIMATIONS ==========
  animations: {
    duration: {
      fast: '150ms',
      normal: '300ms',
      slow: '500ms'
    },
    easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
  },

  // ========== GAMIFICATION ==========
  gamification: {
    xpPerEntry: 50,
    xpPerDetailedEntry: 75,
    xpPerStreak: {
      3: 100,
      7: 250,
      30: 1000
    },
    levelThresholds: [
      0,      // Level 1
      100,    // Level 2
      300,    // Level 3
      600,    // Level 4
      1000,   // Level 5
      1500,   // Level 6
      2100,   // Level 7
      2800,   // Level 8
      3600,   // Level 9
      4500    // Level 10
    ]
  }
};

// ========== HELPER FUNCTIONS ==========
export const getGradient = (type = 'primary') => {
  return type === 'primary' 
    ? theme.colors.primary.gradient 
    : theme.colors.accent.gradient;
};

export const getLevelFromXP = (xp) => {
  const thresholds = theme.gamification.levelThresholds;
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (xp >= thresholds[i]) return i + 1;
  }
  return 1;
};

export const getXPForNextLevel = (currentXP) => {
  const level = getLevelFromXP(currentXP);
  return theme.gamification.levelThresholds[level] || currentXP + 1000;
};

// ════════════════════════════════════════════════════════════
// HOW TO USE:
// ════════════════════════════════════════════════════════════
// 
// Import in any component:
// import { theme } from '@/config/theme';
// 
// Use colors:
// <div style={{ color: theme.colors.primary.main }}>Hello</div>
// 
// Or with Tailwind (update tailwind.config.js):
// colors: theme.colors
// 
// ════════════════════════════════════════════════════════════