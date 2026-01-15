const { GoogleGenerativeAI } = require('@google/generative-ai');
const User = require('../models/User');
const Entry = require('../models/Entry');
const Goal = require('../models/Goal');

// Gemini AI initialization
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ═══════════════════════════════════════════════════════════
// 🎯 GET AI PROMPTS - Predefined suggestions
// ═══════════════════════════════════════════════════════════
exports.getPrompts = async (req, res) => {
  try {
    const prompts = [
      {
        id: 1,
        category: 'mood',
        title: '😊 Analyze My Mood',
        description: 'Get insights about your recent emotional patterns',
        prompt: 'Analyze my mood patterns and give me insights'
      },
      {
        id: 2,
        category: 'goals',
        title: '🎯 Plan a Goal',
        description: 'Get help creating a structured goal plan',
        prompt: 'Help me plan a new goal with milestones'
      },
      {
        id: 3,
        category: 'habits',
        title: '🔄 Suggest Habits',
        description: 'Get personalized habit recommendations',
        prompt: 'Suggest some good habits for my lifestyle'
      },
      {
        id: 4,
        category: 'motivation',
        title: '💪 Get Motivated',
        description: 'Receive personalized motivation and encouragement',
        prompt: 'I need some motivation today'
      },
      {
        id: 5,
        category: 'reflection',
        title: '🤔 Weekly Reflection',
        description: 'Reflect on your weekly progress and learnings',
        prompt: 'Help me reflect on my week'
      },
      {
        id: 6,
        category: 'productivity',
        title: '⚡ Boost Productivity',
        description: 'Get tips to improve your productivity',
        prompt: 'How can I be more productive?'
      }
    ];

    res.status(200).json({
      success: true,
      data: prompts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch prompts',
      error: error.message
    });
  }
};

// ═══════════════════════════════════════════════════════════
// 😊 ANALYZE MOOD - AI analyzes user's mood patterns
// ═══════════════════════════════════════════════════════════
exports.analyzeMood = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get last 7 days entries
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentEntries = await Entry.find({
      user: userId,
      createdAt: { $gte: sevenDaysAgo }
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('mood moodIntensity notes tags category createdAt');

    if (recentEntries.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No recent entries found to analyze. Create some journal entries first!'
      });
    }

    // Prepare context for AI
    const moodSummary = recentEntries.map(entry => ({
      mood: entry.mood,
      intensity: entry.moodIntensity,
      category: entry.category,
      tags: entry.tags,
      date: entry.createdAt.toDateString()
    }));

    const prompt = `
You are a compassionate AI mood analyst and life coach. Analyze the following mood data from the user's journal entries over the past week:

${JSON.stringify(moodSummary, null, 2)}

Please provide:
1. **Overall Mood Pattern**: What's the general emotional trend?
2. **Insights**: What might be contributing to these moods?
3. **Recommendations**: 3-4 actionable suggestions to improve wellbeing
4. **Positive Highlights**: What's going well?

Keep your response empathetic, encouraging, and actionable. Use emojis where appropriate. Keep it under 300 words.
`;

    // Call Gemini AI
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const analysis = result.response.text();

    res.status(200).json({
      success: true,
      data: {
        analysis,
        entriesAnalyzed: recentEntries.length,
        dateRange: {
          from: sevenDaysAgo.toDateString(),
          to: new Date().toDateString()
        }
      }
    });

  } catch (error) {
    console.error('AI Mood Analysis Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze mood',
      error: error.message
    });
  }
};

// ═══════════════════════════════════════════════════════════
// 🎯 PLAN GOAL - AI helps create structured goals
// ═══════════════════════════════════════════════════════════
exports.planGoal = async (req, res) => {
  try {
    const { goalIdea, category, timeframe } = req.body;

    if (!goalIdea) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a goal idea'
      });
    }

    const prompt = `
You are an expert goal-setting coach. A user wants to achieve this goal:

**Goal Idea**: ${goalIdea}
**Category**: ${category || 'Not specified'}
**Timeframe**: ${timeframe || 'Not specified'}

Please help them create a SMART goal plan with:

1. **Refined Goal Title**: A clear, specific goal statement
2. **Measurable Metric**: What will be measured? (e.g., "kilometers", "hours", "completed tasks")
3. **Target Value**: Specific number to achieve
4. **Milestones**: 4-5 progressive milestones with target values
5. **Action Steps**: 3-4 concrete first steps
6. **Success Tips**: 2-3 tips for staying motivated

Format your response in a structured way. Be encouraging and realistic!
`;

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(prompt);
    const plan = result.response.text();

    res.status(200).json({
      success: true,
      data: {
        plan,
        originalIdea: goalIdea
      }
    });

  } catch (error) {
    console.error('AI Goal Planning Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to plan goal',
      error: error.message
    });
  }
};

// ═══════════════════════════════════════════════════════════
// 🔄 SUGGEST HABITS - AI recommends habits
// ═══════════════════════════════════════════════════════════
exports.suggestHabits = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get user's current goals and recent entries
    const [goals, recentEntries] = await Promise.all([
      Goal.find({ user: userId, status: 'active' })
        .select('title category')
        .limit(5),
      Entry.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('category tags')
    ]);

    const userContext = {
      activeGoals: goals.map(g => ({ title: g.title, category: g.category })),
      recentCategories: [...new Set(recentEntries.map(e => e.category))],
      commonTags: [...new Set(recentEntries.flatMap(e => e.tags))]
    };

    const prompt = `
You are a habit formation expert. Based on this user's context:

${JSON.stringify(userContext, null, 2)}

Suggest 5 powerful habits that would help them grow. For each habit:

1. **Habit Name**: Clear, actionable
2. **Why It Matters**: Brief benefit (1-2 sentences)
3. **How to Start**: Simple first step
4. **Frequency**: Daily, weekly, etc.

Make suggestions practical, diverse, and aligned with their goals. Use emojis for engagement!
`;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(prompt);
    const suggestions = result.response.text();

    res.status(200).json({
      success: true,
      data: {
        suggestions,
        basedOn: {
          goalsCount: goals.length,
          entriesAnalyzed: recentEntries.length
        }
      }
    });

  } catch (error) {
    console.error('AI Habit Suggestion Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to suggest habits',
      error: error.message
    });
  }
};

// ═══════════════════════════════════════════════════════════
// 💪 GET MOTIVATION - Personalized motivation
// ═══════════════════════════════════════════════════════════
exports.getMotivation = async (req, res) => {
  try {
    const { situation } = req.body;
    const user = await User.findById(req.user._id)
      .select('name level xp streak');

    const prompt = `
You are an inspiring motivational coach. The user needs motivation in this situation:

**Situation**: ${situation || 'General motivation needed'}

**User Stats**:
- Name: ${user.name}
- Level: ${user.level}
- XP: ${user.xp}
- Current Streak: ${user.streak} days

Provide a personalized, energizing message (150-200 words) that:
1. Acknowledges their progress (use their stats!)
2. Addresses their specific situation
3. Gives 2-3 actionable next steps
4. Ends with a powerful quote or affirmation

Be genuine, empowering, and enthusiastic! 🔥
`;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(prompt);
    const motivation = result.response.text();

    res.status(200).json({
      success: true,
      data: {
        motivation,
        userStats: {
          level: user.level,
          xp: user.xp,
          streak: user.streak
        }
      }
    });

  } catch (error) {
    console.error('AI Motivation Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate motivation',
      error: error.message
    });
  }
};

// ═══════════════════════════════════════════════════════════
// 💬 CHAT - General AI conversation
// ═══════════════════════════════════════════════════════════
exports.chat = async (req, res) => {
  try {
    const { message, conversationHistory } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required'
      });
    }

    const user = await User.findById(req.user._id)
      .select('name level xp streak badges');

    // Get recent context
    const [recentEntries, activeGoals] = await Promise.all([
      Entry.find({ user: req.user._id })
        .sort({ createdAt: -1 })
        .limit(3)
        .select('mood category'),
      Goal.find({ user: req.user._id, status: 'active' })
        .limit(3)
        .select('title progressPercentage')
    ]);

    const systemContext = `
You are LUMIN AI, a supportive and insightful personal growth assistant. You help users with:
- Journaling and self-reflection
- Goal setting and achievement
- Mood tracking and emotional wellbeing
- Productivity and habits
- Personal development

**User Context**:
- Name: ${user.name}
- Level: ${user.level}
- XP: ${user.xp}
- Streak: ${user.streak} days
- Badges: ${user.badges.length}
- Recent mood: ${recentEntries[0]?.mood || 'Unknown'}
- Active goals: ${activeGoals.length}

**Guidelines**:
- Be warm, empathetic, and encouraging
- Give actionable advice
- Reference their progress when relevant
- Keep responses concise (150-250 words)
- Use emojis naturally
- If they ask about features, explain LUMIN's capabilities (journaling, goals, pomodoro, challenges, etc.)

**Previous conversation**:
${conversationHistory ? JSON.stringify(conversationHistory.slice(-3)) : 'None'}

**User's message**: ${message}
`;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const result = await model.generateContent(systemContext);
    const response = result.response.text();

    res.status(200).json({
      success: true,
      data: {
        response,
        timestamp: new Date()
      }
    });

  } catch (error) {
    console.error('AI Chat Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process chat',
      error: error.message
    });
  }
};