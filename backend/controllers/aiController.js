const { GoogleGenerativeAI } = require('@google/generative-ai');
const User = require('../models/User');
const Entry = require('../models/Entry');
const Goal = require('../models/Goal');

// ✅ OPTIMIZED: In-memory cache for user context (5 min expiry)
const userContextCache = new Map();

// ✅ NEW: Response cache for common AI queries
const responseCache = new Map();

// Gemini AI initialization with error handling
if (!process.env.GEMINI_API_KEY) {
  console.error('❌ ERROR: GEMINI_API_KEY environment variable is required!');
}

const genAI = process.env.GEMINI_API_KEY 
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;

// ✅ OPTIMIZED: Single model instance with faster config
const getModel = () => {
  if (!genAI) {
    throw new Error('Gemini AI not configured. Please set GEMINI_API_KEY environment variable.');
  }
  
  try {
    return genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash-lite',  // ✅ Original model name
      generationConfig: {
        maxOutputTokens: 500,     // Increased for better responses
        temperature: 0.7,         // Balanced creativity
        topP: 0.8,                // Focused responses
        topK: 40
      }
    });
  } catch (error) {
    // If model doesn't exist, try fallback
    console.warn('⚠️ Model gemini-2.5-flash-lite not available, trying fallback:', error.message);
    return genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',  // Fallback model
      generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.7,
        topP: 0.8,
        topK: 40
      }
    });
  }
};


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

    const model = getModel();
    const result = await model.generateContent(prompt);
    const analysis = result.response.text();

    const responseData = { analysis, entriesAnalyzed: recentEntries.length };
    
    // Cache the response
    responseCache.set(cacheKey, { data: responseData, timestamp: Date.now() });

    res.status(200).json({ success: true, data: responseData });

  } catch (error) {
    console.error('AI Mood Analysis Error:', error);
    console.error('Error Details:', error.message, error.stack);
    
    let errorMessage = 'Failed to analyze mood';
    let statusCode = 500;
    
    if (error.message?.includes('API_KEY') || error.message?.includes('not configured')) {
      errorMessage = 'AI service not configured. Please set GEMINI_API_KEY.';
    } else if (error.message?.includes('leaked') || error.status === 403) {
      errorMessage = '⚠️ API key has been reported as leaked. Please generate a new API key from Google AI Studio.';
      statusCode = 403;
    } else if (error.message?.includes('API key not valid')) {
      errorMessage = 'Invalid API key. Please check your GEMINI_API_KEY.';
      statusCode = 401;
    } else if (error.message?.includes('quota')) {
      errorMessage = 'API quota exceeded. Please try again later.';
      statusCode = 429;
    } else if (error.message) {
      errorMessage = `Error: ${error.message}`;
    }
    
    res.status(statusCode).json({ 
      success: false, 
      message: errorMessage,
      ...(process.env.NODE_ENV === 'development' && { errorDetails: error.message })
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
      return res.status(400).json({ success: false, message: 'Please provide a goal idea' });
    }

    // ✅ ULTRA SHORT PROMPT
    const prompt = `Create SMART goal for: "${goalIdea}". Format: Title, Metric, 3 Milestones, 2 Action Steps. Max 150 words.`;

    const model = getModel();
    const result = await model.generateContent(prompt);
    const plan = result.response.text();

    res.status(200).json({ success: true, data: { plan, originalIdea: goalIdea } });

  } catch (error) {
    console.error('AI Goal Planning Error:', error);
    console.error('Error Details:', error.message);
    
    let errorMessage = 'Failed to plan goal';
    let statusCode = 500;
    
    if (error.message?.includes('API_KEY') || error.message?.includes('not configured')) {
      errorMessage = 'AI service not configured. Please set GEMINI_API_KEY.';
    } else if (error.message?.includes('leaked') || error.status === 403) {
      errorMessage = '⚠️ API key has been reported as leaked. Please generate a new API key from Google AI Studio.';
      statusCode = 403;
    } else if (error.message?.includes('API key not valid')) {
      errorMessage = 'Invalid API key. Please check your GEMINI_API_KEY.';
      statusCode = 401;
    } else if (error.message?.includes('quota')) {
      errorMessage = 'API quota exceeded. Please try again later.';
      statusCode = 429;
    } else if (error.message) {
      errorMessage = `Error: ${error.message}`;
    }
    
    res.status(statusCode).json({ 
      success: false, 
      message: errorMessage,
      ...(process.env.NODE_ENV === 'development' && { errorDetails: error.message })
    });
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

    const model = getModel();
    const result = await model.generateContent(prompt);
    const suggestions = result.response.text();

    const responseData = { suggestions, basedOn: { goalsCount: goals.length } };
    responseCache.set(cacheKey, { data: responseData, timestamp: Date.now() });

    res.status(200).json({ success: true, data: responseData });

  } catch (error) {
    console.error('AI Habit Suggestion Error:', error);
    console.error('Error Details:', error.message);
    
    let errorMessage = 'Failed to suggest habits';
    let statusCode = 500;
    
    if (error.message?.includes('API_KEY') || error.message?.includes('not configured')) {
      errorMessage = 'AI service not configured. Please set GEMINI_API_KEY.';
    } else if (error.message?.includes('leaked') || error.status === 403) {
      errorMessage = '⚠️ API key has been reported as leaked. Please generate a new API key from Google AI Studio.';
      statusCode = 403;
    } else if (error.message?.includes('API key not valid')) {
      errorMessage = 'Invalid API key. Please check your GEMINI_API_KEY.';
      statusCode = 401;
    } else if (error.message?.includes('quota')) {
      errorMessage = 'API quota exceeded. Please try again later.';
      statusCode = 429;
    } else if (error.message) {
      errorMessage = `Error: ${error.message}`;
    }
    
    res.status(statusCode).json({ 
      success: false, 
      message: errorMessage,
      ...(process.env.NODE_ENV === 'development' && { errorDetails: error.message })
    });
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

    const model = getModel();
    const result = await model.generateContent(prompt);
    const motivation = result.response.text();

    res.status(200).json({
      success: true,
      data: { motivation, userStats: { level: user.level, streak: user.streak } }
    });

  } catch (error) {
    console.error('AI Motivation Error:', error);
    console.error('Error Details:', error.message);
    
    let errorMessage = 'Failed to generate motivation';
    let statusCode = 500;
    
    if (error.message?.includes('API_KEY') || error.message?.includes('not configured')) {
      errorMessage = 'AI service not configured. Please set GEMINI_API_KEY.';
    } else if (error.message?.includes('leaked') || error.status === 403) {
      errorMessage = '⚠️ API key has been reported as leaked. Please generate a new API key from Google AI Studio.';
      statusCode = 403;
    } else if (error.message?.includes('API key not valid')) {
      errorMessage = 'Invalid API key. Please check your GEMINI_API_KEY.';
      statusCode = 401;
    } else if (error.message?.includes('quota')) {
      errorMessage = 'API quota exceeded. Please try again later.';
      statusCode = 429;
    } else if (error.message) {
      errorMessage = `Error: ${error.message}`;
    }
    
    res.status(statusCode).json({ 
      success: false, 
      message: errorMessage,
      ...(process.env.NODE_ENV === 'development' && { errorDetails: error.message })
    });
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

    const model = getModel();
    const result = await model.generateContent(prompt);
    const response = result.response.text();

    res.status(200).json({
      success: true,
      data: { response, timestamp: new Date() }
    });

  } catch (error) {
    console.error('AI Chat Error:', error);
    console.error('Error Details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      status: error.status
    });
    
    // Detailed error messages for debugging
    let errorMessage = 'Failed to process chat';
    let statusCode = 500;
    
    if (error.message?.includes('API_KEY') || error.message?.includes('not configured')) {
      errorMessage = 'AI service not configured. Please set GEMINI_API_KEY in environment variables.';
    } else if (error.message?.includes('leaked') || error.status === 403) {
      errorMessage = '⚠️ Your API key has been reported as leaked and is disabled. Please generate a new API key from Google AI Studio and update GEMINI_API_KEY in your .env file.';
      statusCode = 403;
    } else if (error.message?.includes('API key not valid') || error.message?.includes('Invalid API key')) {
      errorMessage = 'Invalid API key. Please check your GEMINI_API_KEY in .env file.';
      statusCode = 401;
    } else if (error.message?.includes('quota') || error.message?.includes('Quota')) {
      errorMessage = 'API quota exceeded. Please check your Google AI quota or try again later.';
      statusCode = 429;
    } else if (error.message?.includes('model')) {
      errorMessage = `Model error: ${error.message}. Please check if the model name is correct.`;
    } else if (error.message) {
      errorMessage = `AI Error: ${error.message}`;
    }
    
    res.status(statusCode).json({ 
      success: false, 
      message: errorMessage,
      ...(process.env.NODE_ENV === 'development' && { 
        errorDetails: error.message,
        stack: error.stack 
      })
    });
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