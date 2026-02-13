// ════════════════════════════════════════════════════════════
// API UTILITY - Centralized API calls (timeout + token refresh)
// ════════════════════════════════════════════════════════════

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const API_TIMEOUT = 10000; // 10 seconds

const getToken = () => localStorage.getItem('token');
const getRefreshToken = () => localStorage.getItem('refreshToken');

const getHeaders = () => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Fetch with timeout (abort after API_TIMEOUT ms)
async function fetchWithTimeout(url, options = {}, timeoutMs = API_TIMEOUT) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (e) {
    clearTimeout(id);
    if (e.name === 'AbortError') throw new Error('Request timeout. Please try again.');
    throw e;
  }
}

// Authenticated request: timeout + on 401 try refresh token and retry once
async function authenticatedFetch(url, options = {}) {
  const doRequest = (token) => {
    const isFormData = options.body instanceof FormData;
    const headers = {
      ...(!isFormData && { 'Content-Type': 'application/json' }),
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };
    return fetchWithTimeout(url, { ...options, headers }, API_TIMEOUT);
  };

  let res = await doRequest(getToken());

  if (res.status === 401) {
    const refresh = getRefreshToken();
    if (refresh) {
      try {
        const refreshRes = await fetchWithTimeout(
          `${API_BASE_URL}/auth/refresh-token`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken: refresh }),
          },
          API_TIMEOUT
        );
        const data = await refreshRes.json();
        if (data.success && data.token) {
          localStorage.setItem('token', data.token);
          if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
          res = await doRequest(data.token);
        }
      } catch (_) {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        if (typeof window !== 'undefined') window.location.href = '/login';
        throw new Error('Session expired. Please log in again.');
      }
    }
  }

  return res;
}

// ════════════════════════════════════════════════════════════
// ENTRY API CALLS
// ════════════════════════════════════════════════════════════

export const entryAPI = {
  create: async (entryData) => {
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/entries`, {
        method: 'POST',
        body: JSON.stringify(entryData),
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
      const response = await authenticatedFetch(url, { method: 'GET' });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  getOne: async (id) => {
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/entries/${id}`, { method: 'GET' });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  getToday: async () => {
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/entries/today`, { method: 'GET' });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  update: async (id, updates) => {
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/entries/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  delete: async (id) => {
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/entries/${id}`, { method: 'DELETE' });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },
};

// ════════════════════════════════════════════════════════════
// AUTH API CALLS
// ════════════════════════════════════════════════════════════

export const authAPI = {
  register: async (name, email, password) => {
    try {
      const response = await fetchWithTimeout(
        `${API_BASE_URL}/auth/register`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password }),
        },
        API_TIMEOUT
      );
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  login: async (email, password) => {
    try {
      const response = await fetchWithTimeout(
        `${API_BASE_URL}/auth/login`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        },
        API_TIMEOUT
      );
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },
};

// ════════════════════════════════════════════════════════════
// STATS API CALLS
// ════════════════════════════════════════════════════════════

export const statsAPI = {
  getDashboard: async () => {
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/stats/dashboard`, { method: 'GET' });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  getMoodTrends: async (days = 30) => {
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/stats/mood-trends?days=${days}`, { method: 'GET' });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  getWeeklyActivity: async () => {
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/stats/weekly-activity`, { method: 'GET' });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  getGoalConsistency: async (days = 30) => {
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/stats/goal-consistency?days=${days}`, { method: 'GET' });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  getGoalTimeline: async () => {
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/stats/goal-timeline`, { method: 'GET' });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },
};

// ════════════════════════════════════════════════════════════
// GOALS API CALLS
// ════════════════════════════════════════════════════════════

export const goalsAPI = {
  create: async (goalData) => {
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/goals`, {
        method: 'POST',
        body: JSON.stringify(goalData),
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
      const response = await authenticatedFetch(url, { method: 'GET' });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  getOne: async (id) => {
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/goals/${id}`, { method: 'GET' });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  update: async (id, updates) => {
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/goals/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  updateProgress: async (id, currentValue) => {
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/goals/${id}/progress`, {
        method: 'PATCH',
        body: JSON.stringify({ currentValue }),
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  completeMilestone: async (goalId, milestoneId) => {
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/goals/${goalId}/milestones/${milestoneId}`, { method: 'PATCH' });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  delete: async (id) => {
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/goals/${id}`, { method: 'DELETE' });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  getStats: async () => {
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/goals/stats/overview`, { method: 'GET' });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },
};

// ════════════════════════════════════════════════════════════
// CHALLENGES API CALLS
// ════════════════════════════════════════════════════════════

export const challengesAPI = {
  getToday: async () => {
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/challenges/today`, {
        method: 'GET',
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  complete: async (challengeId, progress) => {
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/challenges/${challengeId}/complete`, {
        method: 'PATCH',
        body: JSON.stringify({ progress }),
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  getHistory: async (days = 30) => {
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/challenges/history?days=${days}`, {
        method: 'GET',
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  getStats: async () => {
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/challenges/stats`, {
        method: 'GET',
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
      const response = await authenticatedFetch(`${API_BASE_URL}/ai/prompts`, {
        method: 'GET',
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
      const response = await authenticatedFetch(`${API_BASE_URL}/ai/analyze-mood`, {
        method: 'POST',
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
      const response = await authenticatedFetch(`${API_BASE_URL}/ai/plan-goal`, {
        method: 'POST',
        body: JSON.stringify(goalData),
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
      const response = await authenticatedFetch(`${API_BASE_URL}/ai/suggest-habits`, {
        method: 'POST',
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
      const response = await authenticatedFetch(`${API_BASE_URL}/ai/motivate`, {
        method: 'POST',
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
      const response = await authenticatedFetch(`${API_BASE_URL}/ai/chat`, {
        method: 'POST',
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
      const response = await authenticatedFetch(`${API_BASE_URL}/pomodoro/start`, {
        method: 'POST',
        body: JSON.stringify(sessionData)
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  complete: async (id, notes) => {
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/pomodoro/${id}/complete`, {
        method: 'PATCH',
        body: JSON.stringify({ notes })
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  getAll: async (limit = 20, page = 1) => {
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/pomodoro?limit=${limit}&page=${page}`, {
        method: 'GET',
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  getToday: async () => {
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/pomodoro/today`, {
        method: 'GET',
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  getStats: async (days = 7) => {
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/pomodoro/stats?days=${days}`, {
        method: 'GET',
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  delete: async (id) => {
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/pomodoro/${id}`, {
        method: 'DELETE',
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
      const response = await authenticatedFetch(`${API_BASE_URL}/posts`, {
        method: 'POST',
        body: JSON.stringify(postData)
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  getFeed: async (type = 'all', limit = 20, page = 1) => {
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/posts/feed?type=${type}&limit=${limit}&page=${page}`, {
        method: 'GET',
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  getMyPosts: async () => {
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/posts/my-posts`, {
        method: 'GET',
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  addReaction: async (postId, type) => {
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/posts/${postId}/react`, {
        method: 'POST',
        body: JSON.stringify({ type })
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  removeReaction: async (postId) => {
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/posts/${postId}/react`, {
        method: 'DELETE',
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  addComment: async (postId, content) => {
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/posts/${postId}/comment`, {
        method: 'POST',
        body: JSON.stringify({ content })
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  deleteComment: async (postId, commentId) => {
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/posts/${postId}/comment/${commentId}`, {
        method: 'DELETE',
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  delete: async (postId) => {
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/posts/${postId}`, {
        method: 'DELETE',
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
      const response = await authenticatedFetch(`${API_BASE_URL}/teams`, {
        method: 'POST',
        body: JSON.stringify(teamData)
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  getMyTeams: async () => {
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/teams/my-teams`, {
        method: 'GET',
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  getOne: async (id) => {
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/teams/${id}`, {
        method: 'GET',
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  join: async (inviteCode) => {
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/teams/join`, {
        method: 'POST',
        body: JSON.stringify({ inviteCode })
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  leave: async (id) => {
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/teams/${id}/leave`, {
        method: 'POST',
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  getFeed: async (id) => {
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/teams/${id}/feed`, {
        method: 'GET',
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  getLeaderboard: async (id) => {
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/teams/${id}/leaderboard`, {
        method: 'GET',
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  delete: async (id) => {
    try {
      const response = await authenticatedFetch(`${API_BASE_URL}/teams/${id}`, {
        method: 'DELETE',
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
      const response = await authenticatedFetch(`${API_BASE_URL}/profile`, {
        method: 'GET',
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
      const response = await authenticatedFetch(`${API_BASE_URL}/profile`, {
        method: 'PUT',
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
      const response = await authenticatedFetch(`${API_BASE_URL}/profile/settings`, {
        method: 'PUT',
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
      const response = await authenticatedFetch(`${API_BASE_URL}/profile/password`, {
        method: 'PUT',
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
      const response = await authenticatedFetch(`${API_BASE_URL}/profile/stats`, {
        method: 'GET',
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

      const response = await authenticatedFetch(`${API_BASE_URL}/profile/avatar`, {
        method: 'POST',
        body: formData,
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