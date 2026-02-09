// ════════════════════════════════════════════════════════════
// API UTILITY - Centralized API calls
// ════════════════════════════════════════════════════════════

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ========== GET TOKEN FROM LOCALSTORAGE ==========
const getToken = () => {
  return localStorage.getItem('token');
};

// ========== HEADERS WITH AUTH ==========
const getHeaders = () => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// ════════════════════════════════════════════════════════════
// ENTRY API CALLS
// ════════════════════════════════════════════════════════════

export const entryAPI = {
  create: async (entryData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/entries`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(entryData)
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  getAll: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const url = `${API_BASE_URL}/entries${queryParams ? `?${queryParams}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getHeaders()
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  getOne: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/entries/${id}`, {
        method: 'GET',
        headers: getHeaders()
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  getToday: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/entries/today`, {
        method: 'GET',
        headers: getHeaders()
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  update: async (id, updates) => {
    try {
      const response = await fetch(`${API_BASE_URL}/entries/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(updates)
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  delete: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/entries/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
};

// ════════════════════════════════════════════════════════════
// AUTH API CALLS
// ════════════════════════════════════════════════════════════

export const authAPI = {
  register: async (name, email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  login: async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
};

// ════════════════════════════════════════════════════════════
// STATS API CALLS
// ════════════════════════════════════════════════════════════

export const statsAPI = {
  getDashboard: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/stats/dashboard`, {
        method: 'GET',
        headers: getHeaders()
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  getMoodTrends: async (days = 30) => {
    try {
      const response = await fetch(`${API_BASE_URL}/stats/mood-trends?days=${days}`, {
        method: 'GET',
        headers: getHeaders()
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  getWeeklyActivity: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/stats/weekly-activity`, {
        method: 'GET',
        headers: getHeaders()
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  getGoalConsistency: async (days = 30) => {
    try {
      const response = await fetch(`${API_BASE_URL}/stats/goal-consistency?days=${days}`, {
        method: 'GET',
        headers: getHeaders()
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  getGoalTimeline: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/stats/goal-timeline`, {
        method: 'GET',
        headers: getHeaders()
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
};

// ════════════════════════════════════════════════════════════
// GOALS API CALLS
// ════════════════════════════════════════════════════════════

export const goalsAPI = {
  create: async (goalData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/goals`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(goalData)
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  getAll: async (filters = {}) => {
    try {
      const queryParams = new URLSearchParams(filters).toString();
      const url = `${API_BASE_URL}/goals${queryParams ? `?${queryParams}` : ''}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getHeaders()
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  getOne: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/goals/${id}`, {
        method: 'GET',
        headers: getHeaders()
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  update: async (id, updates) => {
    try {
      const response = await fetch(`${API_BASE_URL}/goals/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(updates)
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  updateProgress: async (id, currentValue) => {
    try {
      const response = await fetch(`${API_BASE_URL}/goals/${id}/progress`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ currentValue })
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  completeMilestone: async (goalId, milestoneId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/goals/${goalId}/milestones/${milestoneId}`, {
        method: 'PATCH',
        headers: getHeaders()
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  delete: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/goals/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  getStats: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/goals/stats/overview`, {
        method: 'GET',
        headers: getHeaders()
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
};

// ════════════════════════════════════════════════════════════
// CHALLENGES API CALLS
// ════════════════════════════════════════════════════════════

export const challengesAPI = {
  getToday: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/challenges/today`, {
        method: 'GET',
        headers: getHeaders()
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  complete: async (challengeId, progress) => {
    try {
      const response = await fetch(`${API_BASE_URL}/challenges/${challengeId}/complete`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ progress })
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  getHistory: async (days = 30) => {
    try {
      const response = await fetch(`${API_BASE_URL}/challenges/history?days=${days}`, {
        method: 'GET',
        headers: getHeaders()
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  getStats: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/challenges/stats`, {
        method: 'GET',
        headers: getHeaders()
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
};

// ════════════════════════════════════════════════════════════
// AI API CALLS
// ════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════
// 🤖 AI API CALLS
// ═══════════════════════════════════════════════════════════

export const aiAPI = {
  /**
   * Get AI prompts suggestions
   */
  getPrompts: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/prompts`, {
        method: 'GET',
        headers: getHeaders()
      });
      return await response.json();
    } catch (error) {
      console.error('Get prompts error:', error);
      return { success: false, message: error.message };
    }
  },

  /**
   * Analyze mood patterns
   */
  analyzeMood: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/analyze-mood`, {
        method: 'POST',
        headers: getHeaders()
      });
      return await response.json();
    } catch (error) {
      console.error('Analyze mood error:', error);
      return { success: false, message: error.message };
    }
  },

  /**
   * Plan a goal with AI
   */
  planGoal: async (goalData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/plan-goal`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(goalData)
      });
      return await response.json();
    } catch (error) {
      console.error('Plan goal error:', error);
      return { success: false, message: error.message };
    }
  },

  /**
   * Get habit suggestions
   */
  suggestHabits: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/suggest-habits`, {
        method: 'POST',
        headers: getHeaders()
      });
      return await response.json();
    } catch (error) {
      console.error('Suggest habits error:', error);
      return { success: false, message: error.message };
    }
  },

  /**
   * Get motivation
   */
  getMotivation: async (data) => {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/motivate`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      return await response.json();
    } catch (error) {
      console.error('Get motivation error:', error);
      return { success: false, message: error.message };
    }
  },

  /**
   * Chat with AI
   */
  chat: async (data) => {
    try {
      const response = await fetch(`${API_BASE_URL}/ai/chat`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data)
      });
      return await response.json();
    } catch (error) {
      console.error('Chat error:', error);
      return { success: false, message: error.message };
    }
  }
};

// ════════════════════════════════════════════════════════════
// POMODORO API CALLS
// ════════════════════════════════════════════════════════════

export const pomodoroAPI = {
  start: async (sessionData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/pomodoro/start`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(sessionData)
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  complete: async (id, notes) => {
    try {
      const response = await fetch(`${API_BASE_URL}/pomodoro/${id}/complete`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ notes })
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  getAll: async (limit = 20, page = 1) => {
    try {
      const response = await fetch(`${API_BASE_URL}/pomodoro?limit=${limit}&page=${page}`, {
        method: 'GET',
        headers: getHeaders()
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  getToday: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/pomodoro/today`, {
        method: 'GET',
        headers: getHeaders()
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  getStats: async (days = 7) => {
    try {
      const response = await fetch(`${API_BASE_URL}/pomodoro/stats?days=${days}`, {
        method: 'GET',
        headers: getHeaders()
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  delete: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/pomodoro/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
};
// ════════════════════════════════════════════════════════════
// POSTS API (COMMUNITY FEED)
// ════════════════════════════════════════════════════════════

export const postsAPI = {
  create: async (postData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/posts`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(postData)
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  getFeed: async (type = 'all', limit = 20, page = 1) => {
    try {
      const response = await fetch(`${API_BASE_URL}/posts/feed?type=${type}&limit=${limit}&page=${page}`, {
        method: 'GET',
        headers: getHeaders()
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  getMyPosts: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/posts/my-posts`, {
        method: 'GET',
        headers: getHeaders()
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  addReaction: async (postId, type) => {
    try {
      const response = await fetch(`${API_BASE_URL}/posts/${postId}/react`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ type })
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  removeReaction: async (postId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/posts/${postId}/react`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  addComment: async (postId, content) => {
    try {
      const response = await fetch(`${API_BASE_URL}/posts/${postId}/comment`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ content })
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  deleteComment: async (postId, commentId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/posts/${postId}/comment/${commentId}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  delete: async (postId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/posts/${postId}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
};

// ════════════════════════════════════════════════════════════
// TEAMS API
// ════════════════════════════════════════════════════════════

export const teamsAPI = {
  create: async (teamData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/teams`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(teamData)
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  getMyTeams: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/teams/my-teams`, {
        method: 'GET',
        headers: getHeaders()
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  getOne: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/teams/${id}`, {
        method: 'GET',
        headers: getHeaders()
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  join: async (inviteCode) => {
    try {
      const response = await fetch(`${API_BASE_URL}/teams/join`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ inviteCode })
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  leave: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/teams/${id}/leave`, {
        method: 'POST',
        headers: getHeaders()
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  getFeed: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/teams/${id}/feed`, {
        method: 'GET',
        headers: getHeaders()
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  getLeaderboard: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/teams/${id}/leaderboard`, {
        method: 'GET',
        headers: getHeaders()
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  delete: async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/teams/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
};

// ═══════════════════════════════════════════════════════════
// 👤 PROFILE API CALLS
// ═══════════════════════════════════════════════════════════

export const profileAPI = {
  /**
   * Get user profile
   */
  getProfile: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/profile`, {
        method: 'GET',
        headers: getHeaders()
      });
      return await response.json();
    } catch (error) {
      console.error('Get profile error:', error);
      return { success: false, message: error.message };
    }
  },

  /**
   * Update profile
   */
  updateProfile: async (profileData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/profile`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(profileData)
      });
      return await response.json();
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, message: error.message };
    }
  },

  /**
   * Update settings
   */
  updateSettings: async (settings) => {
    try {
      const response = await fetch(`${API_BASE_URL}/profile/settings`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(settings)
      });
      return await response.json();
    } catch (error) {
      console.error('Update settings error:', error);
      return { success: false, message: error.message };
    }
  },

  /**
   * Change password
   */
  changePassword: async (passwordData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/profile/password`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(passwordData)
      });
      return await response.json();
    } catch (error) {
      console.error('Change password error:', error);
      return { success: false, message: error.message };
    }
  },

  /**
   * Get user stats
   */
  getStats: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/profile/stats`, {
        method: 'GET',
        headers: getHeaders()
      });
      return await response.json();
    } catch (error) {
      console.error('Get stats error:', error);
      return { success: false, message: error.message };
    }
  },

  /**
   * Upload avatar image
   */
  uploadAvatar: async (file) => {
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/profile/avatar`, {
        method: 'POST',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` })
          // Don't set Content-Type - browser will set it with boundary
        },
        body: formData
      });
      return await response.json();
    } catch (error) {
      console.error('Upload avatar error:', error);
      return { success: false, message: error.message };
    }
  }
};

// Update export to include new APIs
export default { entryAPI, authAPI, statsAPI, goalsAPI, challengesAPI, aiAPI, pomodoroAPI, postsAPI, teamsAPI };