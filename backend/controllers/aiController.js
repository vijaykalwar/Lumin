const { GoogleGenerativeAI } = require('@google/generative-ai');
const User = require('../models/User');
const Entry = require('../models/Entry');
const Goal = require('../models/Goal');

// ✅ OPTIMIZED: In-memory cache for user context (5 min expiry)
const userContextCache = new Map();

// ✅ NEW: Response cache for common AI queries
const responseCache = new Map();

// Gemini AI initialization
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ✅ OPTIMIZED: Single model instance with faster config
const model = genAI.getGenerativeModel({ 
  model: 'gemini-2.5-flash-lite',  // ✅ Fastest Gemini model!
  generationConfig: {
    maxOutputTokens: 300,     // Shorter responses = faster
    temperature: 0.7,         // Balanced creativity
    topP: 0.8,                // Focused responses
    topK: 40
  }
});


// ═══════════════════════════════════════════════════════════
// 🎯 GET AI PROMPTS - Predefined suggestions
// ═══════════════════════════════════════════════════════════
exports.getPrompts = async (req, res) => {
  try {
    // ✅ Static data - instant response
    res.status(200).json({
      success: true,
      data: [
        { id: 1, category: 'mood', title: '😊 Analyze My Mood', description: 'Get insights about your mood', prompt: 'Analyze my mood patterns' },
        { id: 2, category: 'goals', title: '🎯 Plan a Goal', description: 'Create a goal plan', prompt: 'Help me plan a goal' },
        { id: 3, category: 'habits', title: '🔄 Suggest Habits', description: 'Get habit recommendations', prompt: 'Suggest habits for me' },
        { id: 4, category: 'motivation', title: '💪 Get Motivated', description: 'Get motivation', prompt: 'I need motivation' },
        { id: 5, category: 'reflection', title: '🤔 Weekly Reflection', description: 'Reflect on your week', prompt: 'Help me reflect' },
        { id: 6, category: 'productivity', title: '⚡ Boost Productivity', description: 'Productivity tips', prompt: 'How to be more productive?' }
      ]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch prompts' });
  }
};

// ═══════════════════════════════════════════════════════════
// 😊 ANALYZE MOOD - AI analyzes user's mood patterns
// ═══════════════════════════════════════════════════════════
exports.analyzeMood = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    
    // ✅ Check cache first (1 hour for mood analysis)
    const cacheKey = `mood_${userId}`;
    if (responseCache.has(cacheKey)) {
      const cached = responseCache.get(cacheKey);
      if (Date.now() - cached.timestamp < 3600000) { // 1 hour cache
        return res.status(200).json({ success: true, data: cached.data, cached: true });
      }
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentEntries = await Entry.find({
      user: userId,
      createdAt: { $gte: sevenDaysAgo }
    })
      .sort({ createdAt: -1 })
      .limit(5) // ✅ Reduced from 10 to 5
      .select('mood moodIntensity category')
      .lean();

    if (recentEntries.length === 0) {
      return res.status(400).json({ success: false, message: 'No recent entries found.' });
    }

    // ✅ ULTRA SHORT PROMPT
    const prompt = `Mood analysis for: ${JSON.stringify(recentEntries.map(e => e.mood))}. Give: 1) Pattern 2) 2 tips. Max 100 words.`;

    const result = await model.generateContent(prompt);
    const analysis = result.response.text();

    const responseData = { analysis, entriesAnalyzed: recentEntries.length };
    
    // Cache the response
    responseCache.set(cacheKey, { data: responseData, timestamp: Date.now() });

    res.status(200).json({ success: true, data: responseData });

  } catch (error) {
    console.error('AI Mood Analysis Error:', error);
    res.status(500).json({ success: false, message: 'Failed to analyze mood' });
  }
};

// ═══════════════════════════════════════════════════════════
// 🎯 PLAN GOAL - AI helps create structured goals
// ═══════════════════════════════════════════════════════════
exports.planGoal = async (req, res) => {
  try {
    const { goalIdea, category, timeframe } = req.body;

    if (!goalIdea) {
      return res.status(400).json({ success: false, message: 'Please provide a goal idea' });
    }

    // ✅ ULTRA SHORT PROMPT
    const prompt = `Create SMART goal for: "${goalIdea}". Format: Title, Metric, 3 Milestones, 2 Action Steps. Max 150 words.`;

    const result = await model.generateContent(prompt);
    const plan = result.response.text();

    res.status(200).json({ success: true, data: { plan, originalIdea: goalIdea } });

  } catch (error) {
    console.error('AI Goal Planning Error:', error);
    res.status(500).json({ success: false, message: 'Failed to plan goal' });
  }
};

// ═══════════════════════════════════════════════════════════
// 🔄 SUGGEST HABITS - AI recommends habits
// ═══════════════════════════════════════════════════════════
exports.suggestHabits = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    
    // ✅ Check cache (1 hour for habit suggestions)
    const cacheKey = `habits_${userId}`;
    if (responseCache.has(cacheKey)) {
      const cached = responseCache.get(cacheKey);
      if (Date.now() - cached.timestamp < 3600000) {
        return res.status(200).json({ success: true, data: cached.data, cached: true });
      }
    }

    const goals = await Goal.find({ user: userId, status: 'active' })
      .select('title category')
      .limit(3)
      .lean();

    // ✅ ULTRA SHORT PROMPT
    const prompt = `Suggest 3 habits for goals: ${goals.map(g => g.title).join(', ') || 'general improvement'}. Format: Habit + Why + How. Max 100 words.`;

    const result = await model.generateContent(prompt);
    const suggestions = result.response.text();

    const responseData = { suggestions, basedOn: { goalsCount: goals.length } };
    responseCache.set(cacheKey, { data: responseData, timestamp: Date.now() });

    res.status(200).json({ success: true, data: responseData });

  } catch (error) {
    console.error('AI Habit Suggestion Error:', error);
    res.status(500).json({ success: false, message: 'Failed to suggest habits' });
  }
};

// ═══════════════════════════════════════════════════════════
// 💪 GET MOTIVATION - Personalized motivation
// ═══════════════════════════════════════════════════════════
exports.getMotivation = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('name level streak')
      .lean();

    // ✅ ULTRA SHORT PROMPT
    const prompt = `Motivate ${user.name} (Level ${user.level}, ${user.streak} day streak). 80 words max. Be energizing!`;

    const result = await model.generateContent(prompt);
    const motivation = result.response.text();

    res.status(200).json({
      success: true,
      data: { motivation, userStats: { level: user.level, streak: user.streak } }
    });

  } catch (error) {
    console.error('AI Motivation Error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate motivation' });
  }
};

// ═══════════════════════════════════════════════════════════
// 💬 CHAT - General AI conversation (ULTRA OPTIMIZED)
// ═══════════════════════════════════════════════════════════
exports.chat = async (req, res) => {
  try {
    const { message, conversationHistory } = req.body;

    if (!message) {
      return res.status(400).json({ success: false, message: 'Message is required' });
    }

    // ✅ Get user context from cache or fetch
    const cacheKey = req.user._id.toString();
    let user;

    if (userContextCache.has(cacheKey)) {
      const cached = userContextCache.get(cacheKey);
      if (Date.now() - cached.timestamp < 300000) {
        user = cached.data.user;
      }
    }

    if (!user) {
      user = await User.findById(req.user._id)
        .select('name level streak')
        .lean();
      userContextCache.set(cacheKey, { data: { user }, timestamp: Date.now() });
    }

    // ✅ MINIMAL CONTEXT for speed
    const lastMsg = conversationHistory?.slice(-1)[0]?.content || '';
    
    // ✅ ULTRA SHORT SYSTEM PROMPT
    const prompt = `You're LUMIN AI, helping ${user.name} (L${user.level}).
${lastMsg ? `Previous: ${lastMsg.substring(0, 50)}...` : ''}
User: ${message}
Reply in 100-150 words. Be warm, actionable, use emojis.`;

    const result = await model.generateContent(prompt);
    const response = result.response.text();

    res.status(200).json({
      success: true,
      data: { response, timestamp: new Date() }
    });

  } catch (error) {
    console.error('AI Chat Error:', error);
    res.status(500).json({ success: false, message: 'Failed to process chat' });
  }
};

// ═══════════════════════════════════════════════════════════
// 🧹 Clear caches (utility - call every hour)
// ═══════════════════════════════════════════════════════════
setInterval(() => {
  const now = Date.now();
  
  // Clean user context cache (>5 min old)
  for (const [key, value] of userContextCache) {
    if (now - value.timestamp > 300000) userContextCache.delete(key);
  }
  
  // Clean response cache (>1 hour old)
  for (const [key, value] of responseCache) {
    if (now - value.timestamp > 3600000) responseCache.delete(key);
  }
}, 600000); // Run every 10 minutes