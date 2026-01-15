const Challenge = require('../models/Challenge');

// Challenge templates
const challengeTemplates = {
  'word-count': {
    title: '📝 Wordsmith',
    description: 'Write an entry with at least 150 words',
    target: 150,
    xpReward: 50
  },
  'early-bird': {
    title: '🌅 Early Bird',
    description: 'Journal before 9:00 AM',
    target: 1,
    xpReward: 60
  },
  'night-owl': {
    title: '🦉 Night Owl',
    description: 'Journal after 10:00 PM',
    target: 1,
    xpReward: 60
  },
  'tag-master': {
    title: '🏷️ Tag Master',
    description: 'Use at least 3 tags in your entry',
    target: 3,
    xpReward: 40
  },
  'streak-keeper': {
    title: '🔥 Streak Keeper',
    description: 'Maintain your daily streak',
    target: 1,
    xpReward: 70
  },
  'mood-variety': {
    title: '🎭 Mood Explorer',
    description: 'Log a mood different from yesterday',
    target: 1,
    xpReward: 45
  },
  'detailed-entry': {
    title: '📖 Detailed Chronicler',
    description: 'Write a detailed entry (200+ words)',
    target: 200,
    xpReward: 80
  },
  'grateful': {
    title: '🙏 Gratitude Practice',
    description: 'Mention something you\'re grateful for',
    target: 1,
    xpReward: 55
  },
  'reflection': {
    title: '💭 Deep Thinker',
    description: 'Reflect on your day with meaningful insights',
    target: 1,
    xpReward: 65
  }
};

// Generate daily challenges
exports.generateDailyChallenges = async (userId) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if challenges already exist for today
  let dailyChallenge = await Challenge.findOne({
    user: userId,
    date: today
  });

  if (dailyChallenge) {
    return dailyChallenge;
  }

  // Select 3 random challenges
  const challengeTypes = Object.keys(challengeTemplates);
  const selectedTypes = [];
  
  while (selectedTypes.length < 3) {
    const randomType = challengeTypes[Math.floor(Math.random() * challengeTypes.length)];
    if (!selectedTypes.includes(randomType)) {
      selectedTypes.push(randomType);
    }
  }

  // Create challenge instances
  const challenges = selectedTypes.map(type => {
    const template = challengeTemplates[type];
    return {
      type,
      title: template.title,
      description: template.description,
      target: template.target,
      xpReward: template.xpReward
    };
  });

  // Save to database
  dailyChallenge = await Challenge.create({
    user: userId,
    date: today,
    challenges
  });

  return dailyChallenge;
};

// Update challenge progress
exports.updateChallengeProgress = async (userId, entry) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dailyChallenge = await Challenge.findOne({
    user: userId,
    date: today
  });

  if (!dailyChallenge) return null;

  let updated = false;

  dailyChallenge.challenges.forEach(challenge => {
    if (challenge.completed) return;

    switch (challenge.type) {
      case 'word-count':
        if (entry.wordCount >= challenge.target) {
          challenge.progress = entry.wordCount;
          challenge.completed = true;
          challenge.completedAt = new Date();
          updated = true;
        }
        break;

      case 'early-bird':
        const hour = new Date(entry.createdAt).getHours();
        if (hour < 9) {
          challenge.progress = 1;
          challenge.completed = true;
          challenge.completedAt = new Date();
          updated = true;
        }
        break;

      case 'night-owl':
        const nightHour = new Date(entry.createdAt).getHours();
        if (nightHour >= 22) {
          challenge.progress = 1;
          challenge.completed = true;
          challenge.completedAt = new Date();
          updated = true;
        }
        break;

      case 'tag-master':
        if (entry.tags && entry.tags.length >= challenge.target) {
          challenge.progress = entry.tags.length;
          challenge.completed = true;
          challenge.completedAt = new Date();
          updated = true;
        }
        break;

      case 'detailed-entry':
        if (entry.wordCount >= challenge.target) {
          challenge.progress = entry.wordCount;
          challenge.completed = true;
          challenge.completedAt = new Date();
          updated = true;
        }
        break;

      case 'grateful':
        const gratefulKeywords = ['grateful', 'thankful', 'appreciate', 'blessing', 'fortunate'];
        const hasGratitude = gratefulKeywords.some(word => 
          entry.notes.toLowerCase().includes(word)
        );
        if (hasGratitude) {
          challenge.progress = 1;
          challenge.completed = true;
          challenge.completedAt = new Date();
          updated = true;
        }
        break;
    }
  });

  if (updated) {
    await dailyChallenge.checkCompletion();
  }

  return dailyChallenge;
};