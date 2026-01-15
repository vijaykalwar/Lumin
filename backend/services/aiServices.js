const { GoogleGenerativeAI } = require('@google/generative-ai');

// ════════════════════════════════════════════════════════════
// GEMINI AI SERVICE - Complete Implementation
// ════════════════════════════════════════════════════════════

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ════════════════════════════════════════════════════════════
// 1. SMART JOURNAL PROMPTS
// ════════════════════════════════════════════════════════════
exports.generateSmartPrompts = async (userData) => {
  try {
    const { recentMoods, goals, timeOfDay, streak } = userData;
    
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const prompt = `
You are a journaling coach. Generate 3 thoughtful journal prompts for a user.

Context:
- Recent moods: ${recentMoods.join(', ')}
- Active goals: ${goals.length}
- Time: ${timeOfDay}
- Current streak: ${streak} days

Requirements:
1. Make prompts mood-appropriate and supportive
2. Connect to their goals when relevant
3. Use time-of-day context (morning = reflection, evening = gratitude)
4. Keep each prompt under 15 words
5. Be encouraging and specific

Return ONLY a JSON array with 3 prompts:
[
  "Prompt 1 text here",
  "Prompt 2 text here", 
  "Prompt 3 text here"
]

No markdown, no explanation, just the JSON array.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();
    
    // Remove markdown code blocks if present
    const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    const prompts = JSON.parse(cleanText);
    
    return {
      success: true,
      prompts: prompts.slice(0, 3) // Ensure only 3
    };
  } catch (error) {
    console.error('Smart Prompts Error:', error);
    return {
      success: false,
      error: error.message,
      prompts: [
        "What made you smile today?",
        "What's one thing you're grateful for?",
        "How are you feeling right now?"
      ]
    };
  }
};

// ════════════════════════════════════════════════════════════
// 2. MOOD ANALYSIS (Weekly Summary + Patterns)
// ════════════════════════════════════════════════════════════
exports.analyzeMood = async (weeklyData) => {
  try {
    const { entries, moodDistribution } = weeklyData;
    
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const prompt = `
You are a mental wellness analyst. Analyze this user's weekly journal data.

Data:
- Total entries: ${entries.length}
- Mood distribution: ${JSON.stringify(moodDistribution)}
- Sample entries: ${entries.slice(0, 5).map(e => `${e.mood}: "${e.notes.substring(0, 100)}"`).join(' | ')}

Provide analysis in this EXACT JSON format:
{
  "summary": "2-3 sentence overall summary",
  "patterns": [
    "Pattern 1 observation",
    "Pattern 2 observation"
  ],
  "insights": [
    "Insight 1",
    "Insight 2"
  ],
  "suggestions": [
    "Actionable suggestion 1",
    "Actionable suggestion 2"
  ],
  "encouragement": "Personalized encouraging message"
}

Keep it concise, supportive, and actionable. No markdown, just JSON.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();
    
    const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    const analysis = JSON.parse(cleanText);
    
    return {
      success: true,
      analysis
    };
  } catch (error) {
    console.error('Mood Analysis Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// ════════════════════════════════════════════════════════════
// 3. GOAL PLANNING ASSISTANT
// ════════════════════════════════════════════════════════════
exports.planGoal = async (goalData) => {
  try {
    const { title, description, targetValue, targetDate, category } = goalData;
    
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const prompt = `
You are a goal-setting coach. Help break down this goal into actionable steps.

Goal:
- Title: ${title}
- Description: ${description}
- Target: ${targetValue} by ${targetDate}
- Category: ${category}

Create a detailed plan in this EXACT JSON format:
{
  "breakdown": [
    {
      "phase": "Phase 1: [Name]",
      "duration": "X weeks",
      "tasks": ["Task 1", "Task 2", "Task 3"]
    },
    {
      "phase": "Phase 2: [Name]",
      "duration": "X weeks", 
      "tasks": ["Task 1", "Task 2", "Task 3"]
    }
  ],
  "milestones": [
    {
      "title": "Milestone 1",
      "targetValue": 25,
      "description": "What this achieves"
    },
    {
      "title": "Milestone 2",
      "targetValue": 50,
      "description": "What this achieves"
    },
    {
      "title": "Milestone 3",
      "targetValue": 75,
      "description": "What this achieves"
    }
  ],
  "tips": [
    "Practical tip 1",
    "Practical tip 2",
    "Practical tip 3"
  ],
  "motivation": "Encouraging message about achieving this goal"
}

Be specific, realistic, and encouraging. No markdown, just JSON.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();
    
    const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    const plan = JSON.parse(cleanText);
    
    return {
      success: true,
      plan
    };
  } catch (error) {
    console.error('Goal Planning Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// ════════════════════════════════════════════════════════════
// 4. HABIT RECOMMENDATIONS
// ════════════════════════════════════════════════════════════
exports.suggestHabits = async (userData) => {
  try {
    const { entries, goals, currentHabits } = userData;
    
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const prompt = `
You are a habit-building coach. Suggest new habits based on user data.

Context:
- Recent journal themes: ${entries.slice(0, 10).map(e => e.notes.substring(0, 50)).join(' | ')}
- Goals: ${goals.map(g => g.title).join(', ')}
- Current habits: ${currentHabits?.join(', ') || 'None yet'}

Suggest habits in this EXACT JSON format:
{
  "habits": [
    {
      "title": "Habit name",
      "description": "Why this helps",
      "frequency": "daily" or "weekly",
      "difficulty": "easy" or "medium" or "hard",
      "category": "health" or "productivity" or "mindfulness" or "learning",
      "xpReward": 30
    }
  ],
  "reasoning": "Why these habits were chosen for this user"
}

Suggest 3-5 habits. Be specific and actionable. No markdown, just JSON.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();
    
    const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    const suggestions = JSON.parse(cleanText);
    
    return {
      success: true,
      suggestions
    };
  } catch (error) {
    console.error('Habit Suggestions Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// ════════════════════════════════════════════════════════════
// 5. PERSONALIZED MOTIVATION
// ════════════════════════════════════════════════════════════
exports.generateMotivation = async (context) => {
  try {
    const { 
      mood, 
      streak, 
      recentProgress, 
      goals, 
      timeOfDay,
      situation // 'low_streak', 'goal_progress', 'achievement', 'struggling'
    } = context;
    
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const prompt = `
You are a supportive life coach. Generate a personalized motivational message.

Context:
- Current mood: ${mood}
- Streak: ${streak} days
- Recent progress: ${recentProgress}
- Goals: ${goals?.length || 0} active
- Time: ${timeOfDay}
- Situation: ${situation}

Requirements:
1. Be genuine and empathetic
2. Acknowledge their current state
3. Provide specific encouragement
4. Keep it under 100 words
5. End with an actionable next step

Return a JSON object:
{
  "message": "The motivational message",
  "actionButton": {
    "text": "Button text (e.g., 'Create entry', 'Review goals')",
    "action": "entry" or "goal" or "challenge"
  }
}

No markdown, just JSON.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();
    
    const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    const motivation = JSON.parse(cleanText);
    
    return {
      success: true,
      motivation
    };
  } catch (error) {
    console.error('Motivation Error:', error);
    return {
      success: false,
      error: error.message,
      motivation: {
        message: "Every step forward counts. You're doing great by showing up today! 🌟",
        actionButton: {
          text: "Create entry",
          action: "entry"
        }
      }
    };
  }
};

// ════════════════════════════════════════════════════════════
// 6. ENHANCED CHATBOT (Context-Aware)
// ════════════════════════════════════════════════════════════
exports.chatWithAI = async (messages, userData) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    // Build context from user data
    const userContext = `
User Profile:
- Level: ${userData.level || 1}
- XP: ${userData.xp || 0}
- Current Streak: ${userData.streak || 0} days
- Active Goals: ${userData.goalsCount || 0}
- Recent Mood: ${userData.recentMood || 'unknown'}
- Total Entries: ${userData.totalEntries || 0}
`;

    // System prompt
    const systemPrompt = `
You are LUMIN AI, a supportive personal growth assistant. You help users with:
- Journaling and self-reflection
- Goal setting and tracking
- Habit building
- Motivation and encouragement

${userContext}

Instructions:
1. Be warm, supportive, and conversational
2. Use the user's data to personalize responses
3. Suggest quick actions when relevant (create entry, set goal, etc.)
4. Keep responses under 150 words unless asked for detail
5. Use emojis sparingly (1-2 per message)
6. Be encouraging about their progress

Current conversation:
`;

    // Format conversation history
    const conversationHistory = messages.map(msg => 
      `${msg.role === 'user' ? 'User' : 'LUMIN'}: ${msg.content}`
    ).join('\n');

    const fullPrompt = systemPrompt + conversationHistory + '\nLUMIN:';

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text().trim();
    
    return {
      success: true,
      message: text
    };
  } catch (error) {
    console.error('Chatbot Error:', error);
    return {
      success: false,
      error: error.message,
      message: "I'm having trouble connecting right now. Please try again! 🌟"
    };
  }
};

module.exports = exports;