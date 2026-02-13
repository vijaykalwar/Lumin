import confetti from 'canvas-confetti';

/**
 * Trigger confetti celebration animation
 * @param {string} type - Type of celebration: 'goal', 'streak', 'badge', 'levelup'
 */
export const triggerConfetti = (type = 'goal') => {
  const configs = {
    goal: {
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#a855f7', '#ec4899', '#8b5cf6', '#f59e0b']
    },
    streak: {
      particleCount: 150,
      spread: 100,
      origin: { y: 0.5 },
      colors: ['#fb923c', '#f97316', '#ea580c'],
      startVelocity: 45
    },
    badge: {
      particleCount: 80,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#fbbf24', '#f59e0b', '#eab308'],
      shapes: ['star'],
      scalar: 1.2
    },
    levelup: {
      particleCount: 200,
      spread: 120,
      origin: { y: 0.6 },
      colors: ['#06b6d4', '#0ea5e9', '#3b82f6', '#8b5cf6'],
      ticks: 200,
      startVelocity: 50
    }
  };

  const config = configs[type] || configs.goal;
  confetti(config);

  // Second burst for extra effect
  setTimeout(() => {
    confetti({
      ...config,
      particleCount: config.particleCount / 2,
      angle: 60
    });
  }, 250);

  setTimeout(() => {
    confetti({
      ...config,
      particleCount: config.particleCount / 2,
      angle: 120
    });
  }, 400);
};

/**
 * Celebration for streak milestones with fire theme
 */
export const celebrateStreak = (streakDays) => {
  // Fire emoji rain
  const scalar = 2;
  const fire = confetti.shapeFromText({ text: '🔥', scalar });

  confetti({
    particleCount: 30,
    spread: 100,
    startVelocity: 45,
    shapes: [fire],
    scalar
  });

  triggerConfetti('streak');

  // Show streak message
  return `${streakDays} Day Streak! 🔥`;
};

/**
 * Celebration for badge unlock
 */
export const celebrateBadge = (badgeName) => {
  triggerConfetti('badge');
  
  // Trophy emoji burst
  const scalar = 2;
  const trophy = confetti.shapeFromText({ text: '🏆', scalar });

  setTimeout(() => {
    confetti({
      particleCount: 20,
      spread: 80,
      shapes: [trophy],
      scalar
    });
  }, 300);

  return `Badge Unlocked: ${badgeName}! 🏆`;
};

/**
 * Celebration for level up with fireworks
 */
export const celebrateLevelUp = (newLevel) => {
  // Fireworks effect
  const duration = 3000;
  const animationEnd = Date.now() + duration;

  const randomInRange = (min, max) => Math.random() * (max - min) + min;

  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    confetti({
      particleCount: 3,
      angle: randomInRange(55, 125),
      spread: randomInRange(50, 70),
      origin: { x: randomInRange(0.1, 0.9), y: Math.random() - 0.2 },
      colors: ['#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899']
    });
  }, 100);

  return `Level ${newLevel} Unlocked! 🎉`;
};

/**
 * Play success sound (optional, can be disabled by user)
 */
export const playSuccessSound = () => {
  try {
    const audio = new Audio('/sounds/success.mp3');
    audio.volume = 0.3;
    audio.play().catch(() => {
      // Silently fail if sound doesn't exist or autoplay blocked
    });
  } catch (error) {
    // Ignore sound errors
  }
};

/**
 * Play badge unlock sound
 */
export const playBadgeSound = () => {
  try {
    const audio = new Audio('/sounds/badge-unlock.mp3');
    audio.volume = 0.4;
    audio.play().catch(() => {});
  } catch (error) {
    // Ignore
  }
};

/**
 * Combined celebration with confetti + sound
 */
export const celebrate = (type = 'goal', options = {}) => {
  const { playSound = true, ...restOptions } = options;

  // Trigger confetti
  switch (type) {
    case 'streak':
      if (restOptions.streakDays) {
        celebrateStreak(restOptions.streakDays);
      } else {
        triggerConfetti('streak');
      }
      break;
    case 'badge':
      celebrateBadge(restOptions.badgeName || 'Achievement');
      if (playSound) playBadgeSound();
      break;
    case 'levelup':
      celebrateLevelUp(restOptions.newLevel || 1);
      if (playSound) playSuccessSound();
      break;
    default:
      triggerConfetti('goal');
      if (playSound) playSuccessSound();
  }
};

export default {
  triggerConfetti,
  celebrateStreak,
  celebrateBadge,
  celebrateLevelUp,
  celebrate,
  playSuccessSound,
  playBadgeSound
};
