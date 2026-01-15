# 📁 LUMIN - Complete File Structure & Code Reference

## 📂 Project Root Structure

```
lumin_react/
├── 📂 backend/                    # Node.js + Express Backend
│   ├── 📂 config/                 # Configuration files
│   │   └── db.js                  # MongoDB connection
│   ├── 📂 controllers/            # Route handlers/logic
│   │   ├── aiController.js        # AI/Gemini API logic (9KB)
│   │   ├── authController.js      # Login/Register logic (2KB)
│   │   ├── challengeController.js # Daily challenges logic (7KB)
│   │   ├── entryController.js     # Journal entries CRUD (15KB) ⚠️ Has duplicate code
│   │   ├── goalController.js      # Goals management (14KB)
│   │   ├── pomodoroController.js  # Pomodoro sessions (10KB)
│   │   ├── postController.js      # Community posts (10KB)
│   │   ├── statsController.js     # Analytics/stats (11KB)
│   │   └── teamController.js      # Teams management (22KB)
│   ├── 📂 middleware/             # Express middlewares
│   │   └── authMiddleware.js      # JWT authentication
│   ├── 📂 models/                 # MongoDB Schemas
│   │   ├── Challenge.js           # Daily challenges schema (2KB)
│   │   ├── Entry.js               # Journal entry schema (4KB)
│   │   ├── Goal.js                # SMART goals schema (6KB)
│   │   ├── PomodoroSession.js     # Pomodoro schema (4KB)
│   │   ├── Post.js                # Community post schema (5KB)
│   │   ├── Streak.js              # Streak tracking (1KB)
│   │   ├── Team.js                # Teams schema (5KB)
│   │   └── User.js                # User schema with gamification (2KB)
│   ├── 📂 routes/                 # API route definitions
│   │   ├── ai.js                  # /api/ai routes (1KB)
│   │   ├── auth.js                # /api/auth routes (1KB)
│   │   ├── challenges.js          # /api/challenges routes (1KB)
│   │   ├── entries.js             # /api/entries routes (13KB)
│   │   ├── goals.js               # /api/goals routes (1KB)
│   │   ├── pomodoro.js            # /api/pomodoro routes (1KB)
│   │   ├── posts.js               # /api/posts routes (1KB)
│   │   ├── stats.js               # /api/stats routes (1KB)
│   │   └── teams.js               # /api/teams routes (1KB)
│   ├── 📂 services/               # Business logic services
│   │   └── challengeService.js    # Challenge generation logic
│   ├── 📂 utils/                  # Utility functions
│   │   └── gamification.js        # XP, level, badge calculations
│   ├── .env                       # Environment variables (⚠️ Don't share)
│   ├── package.json               # Backend dependencies
│   └── server.js                  # Express app entry point (3KB)
│
├── 📂 frontend/                   # React + Vite Frontend
│   ├── 📂 public/                 # Static assets
│   ├── 📂 src/
│   │   ├── 📂 assets/             # Images, fonts
│   │   ├── 📂 components/         # Reusable UI components
│   │   │   ├── AnimatedBackground.jsx   # Background animations (2KB)
│   │   │   ├── AnimatedBorder.jsx       # Border animations (1KB)
│   │   │   ├── Badge.jsx                # Badge display (1KB)
│   │   │   ├── Button.jsx               # Button component (2KB)
│   │   │   ├── Card.jsx                 # Card wrapper (2KB)
│   │   │   ├── DailyChallenges.jsx      # Challenge widget (5KB)
│   │   │   ├── Input.jsx                # Input component (2KB)
│   │   │   ├── LevelBadge.jsx           # Level display (1KB)
│   │   │   ├── Logo.jsx                 # App logo (5KB)
│   │   │   ├── Modal.jsx                # Modal component (1KB)
│   │   │   ├── Navbar.jsx               # Navigation bar (6KB)
│   │   │   ├── StreakFire.jsx           # Streak fire animation (1KB)
│   │   │   ├── Tabs.jsx                 # Tab component (1KB)
│   │   │   ├── ThemeToggle.jsx          # Theme switcher (1KB)
│   │   │   ├── XPProgressBar.jsx        # XP progress display (1KB)
│   │   │   └── index.js                 # Component exports (1KB)
│   │   ├── 📂 config/             # Frontend configuration
│   │   │   └── theme.js           # Theme colors/config (1KB)
│   │   ├── 📂 contexts/           # React Context providers
│   │   │   ├── AuthContext.jsx    # Authentication state (2KB)
│   │   │   └── ThemeContext.jsx   # Theme state (1KB)
│   │   ├── 📂 pages/              # Page components
│   │   │   ├── AIChat.jsx         # AI chatbot page (8KB)
│   │   │   ├── AddEntry.jsx       # Create journal entry form (10KB)
│   │   │   ├── Analytics.jsx      # Charts & analytics (14KB)
│   │   │   ├── Challenges.jsx     # Daily challenges page (6KB)
│   │   │   ├── CommunityFeed.jsx  # Community posts feed (11KB)
│   │   │   ├── CreateGoal.jsx     # Create goal form (13KB)
│   │   │   ├── Dashboard.jsx      # Main dashboard (11KB)
│   │   │   ├── Entries.jsx        # Journal entries list (4KB)
│   │   │   ├── GettingStarted.jsx # Onboarding page (7KB)
│   │   │   ├── GoalDetail.jsx     # Single goal view (10KB)
│   │   │   ├── Goals.jsx          # Goals list page (11KB)
│   │   │   ├── Home.jsx           # Landing page (12KB)
│   │   │   ├── Login.jsx          # Login form (7KB)
│   │   │   ├── Pages.jsx          # Page layouts (3KB)
│   │   │   ├── PomodoroTimer.jsx  # Pomodoro timer (18KB)
│   │   │   ├── Register.jsx       # Registration form (8KB)
│   │   │   ├── TeamDetail.jsx     # Team details page (13KB)
│   │   │   └── Teams.jsx          # Teams list page (12KB)
│   │   ├── 📂 utils/              # Utility functions
│   │   │   └── api.js             # All API calls (23KB) ⭐ IMPORTANT
│   │   ├── App.jsx                # Main app with routes (3KB)
│   │   ├── index.css              # Global styles (3KB)
│   │   └── main.jsx               # React entry point (1KB)
│   ├── index.html                 # HTML template
│   ├── package.json               # Frontend dependencies
│   ├── postcss.config.js          # PostCSS config
│   ├── tailwind.config.js         # Tailwind config (1KB)
│   └── vite.config.js             # Vite config
│
├── 📄 CLAUDE_AI_PROJECT_GUIDE.md  # AI handoff guide (10KB)
├── 📄 COMBINED_CODEBASE.md        # All code combined (264KB)
├── 📄 ERRORS_AND_SOLUTIONS.md     # Known errors (9KB)
├── 📄 FILES_TO_SHARE.md           # File sharing guide (3KB)
├── 📄 HOW_TO_SHARE_FILES.md       # Sharing instructions (5KB)
└── 📄 PROJECT_COMPLETE_INFO.md    # This documentation (NEW)
```

---

## 📝 Detailed File Contents

### Backend Files

---

#### 📄 `backend/server.js` - Express App Entry Point

**Lines:** 102 | **Size:** 3KB

**Contains:**

- Express app initialization
- CORS & JSON middleware
- Request logging (development)
- Route imports:
  - `/api/auth` → auth.js
  - `/api/entries` → entries.js
  - `/api/stats` → stats.js
  - `/api/goals` → goals.js
  - `/api/ai` → ai.js
  - `/api/pomodoro` → pomodoro.js
  - `/api/posts` → posts.js
  - `/api/teams` → teams.js
- Health check endpoint (`/`)
- 404 handler
- Error handlers (unhandledRejection, uncaughtException)

---

#### 📄 `backend/models/User.js` - User Schema

**Lines:** 90 | **Size:** 2KB

**Fields:**

```javascript
{
  name: String (required),
  email: String (unique, required),
  password: String (required, min 6),

  // Gamification
  xp: Number (default: 0),
  level: Number (default: 1),
  streak: Number (default: 0),
  lastEntryDate: Date,

  // Badges
  badges: [{
    name: String,
    displayName: String,
    earnedAt: Date,
    xpAwarded: Number
  }],

  // Profile
  avatar: String,
  bio: String (max 500),

  // Settings
  settings: {
    emailNotifications: Boolean,
    dailyReminder: Boolean,
    reminderTime: String
  }
}
```

---

#### 📄 `backend/models/Entry.js` - Journal Entry Schema

**Lines:** 165 | **Size:** 4KB

**Fields:**

```javascript
{
  user: ObjectId (ref: User),
  mood: Enum ['amazing','happy','neutral','sad','angry','anxious','stressed','excited'],
  moodEmoji: String,
  moodIntensity: Number (1-10),
  title: String (max 100),
  notes: String (required, 10-5000 chars),
  tags: [String],
  category: Enum ['personal','work','health','goals','gratitude','reflection','other'],
  location: { enabled, coordinates, placeName, city, country },
  isPrivate: Boolean,
  wordCount: Number,
  entryDate: Date,
  xpAwarded: Number,
  linkedPomodoro: ObjectId
}

// Virtual Fields:
- isDetailed (boolean, 100+ words)
- formattedDate (string)
```

---

#### 📄 `backend/models/Goal.js` - SMART Goals Schema

**Lines:** 213 | **Size:** 6KB

**Fields:**

```javascript
{
  user: ObjectId,
  title: String (max 100),
  description: String (max 500),

  // Measurable
  metric: String,
  targetValue: Number,
  currentValue: Number,
  unit: String,

  // Category & Priority
  category: Enum ['career','health','learning','finance','relationships','hobbies','other'],
  priority: Enum ['low','medium','high'],

  // Time-bound
  startDate: Date,
  targetDate: Date,

  // Milestones
  milestones: [{
    title: String,
    description: String,
    targetValue: Number,
    completed: Boolean,
    completedAt: Date,
    xpReward: Number (default: 25)
  }],

  status: Enum ['active','completed','abandoned','paused'],
  completedAt: Date,
  xpReward: Number (default: 200),
  badgeAwarded: String,
  tags: [String],
  notes: String,
  linkedEntries: [ObjectId],
  reminderEnabled: Boolean,
  reminderTime: String
}

// Virtual Fields:
- progressPercentage
- isOverdue
- daysRemaining
- milestoneProgress

// Methods:
- updateProgress(newValue)
- completeMilestone(milestoneId)
```

---

#### 📄 `backend/models/PomodoroSession.js`

**Lines:** ~120 | **Size:** 4KB

**Contains:**

- Session types (work, shortBreak, longBreak)
- Duration tracking
- Status management
- XP rewards
- Notes/task description

---

#### 📄 `backend/models/Challenge.js`

**Lines:** ~50 | **Size:** 2KB

**Contains:**

- Challenge types
- XP rewards
- Completion status
- Daily reset logic

---

### Frontend Files

---

#### 📄 `frontend/src/App.jsx` - Main App Component

**Lines:** 103 | **Size:** 3KB

**Contains:**

```javascript
// Providers
<ThemeProvider>
  <AuthProvider>
    <BrowserRouter>

// Routes:
- / → Home (public)
- /register → Register (public)
- /login → Login (public)
- /dashboard → Dashboard (protected)
- /add-entry → AddEntry (protected)
- /entries → Entries (protected)
- /goals → Goals (protected)
- /analytics → Analytics (protected)
- /create-goal → CreateGoal (protected)
- /goals/:id → GoalDetail (protected)
- /challenges → Challenges (protected)
- /ai-chat → AIChat (protected)
- /pomodoro → PomodoroTimer (protected)
- /community → CommunityFeed (protected)
- /teams → Teams (protected)
- /teams/:id → TeamDetail (protected)
```

---

#### 📄 `frontend/src/utils/api.js` - Centralized API Calls

**Lines:** 735 | **Size:** 23KB

**API Modules:**

```javascript
// 1. entryAPI
-create(entryData) -
  getAll(filters) -
  getOne(id) -
  getToday() -
  update(id, updates) -
  delete id -
  // 2. authAPI
  register(name, email, password) -
  login(email, password) -
  // 3. statsAPI
  getDashboard() -
  getMoodTrends(days) -
  getWeeklyActivity() -
  getGoalConsistency(days) -
  getGoalTimeline() -
  // 4. goalsAPI
  create(goalData) -
  getAll(filters) -
  getOne(id) -
  update(id, updates) -
  updateProgress(id, currentValue) -
  completeMilestone(goalId, milestoneId) -
  delete id -
  getStats() -
  // 5. challengesAPI
  getToday() -
  complete(challengeId, progress) -
  getHistory(days) -
  getStats() -
  // 6. aiAPI
  getPrompts() -
  analyzeMood() -
  planGoal(goalData) -
  suggestHabits() -
  getMotivation(situation) -
  chat(messages) -
  // 7. pomodoroAPI
  start(sessionData) -
  complete(id, notes) -
  getAll(limit, page) -
  getToday() -
  getStats(days) -
  delete id -
  // 8. postsAPI
  create(postData) -
  getFeed(type, limit, page) -
  getMyPosts() -
  addReaction(postId, type) -
  removeReaction(postId) -
  addComment(postId, content) -
  deleteComment(postId, commentId) -
  delete postId -
  // 9. teamsAPI
  create(teamData) -
  getMyTeams() -
  getOne(id) -
  join(inviteCode) -
  leave(id) -
  getFeed(id) -
  getLeaderboard(id) -
  delete id;
```

---

#### 📄 `frontend/src/contexts/AuthContext.jsx`

**Lines:** ~80 | **Size:** 2KB

**Contains:**

```javascript
// State:
-user(object) -
  isAuthenticated(boolean) -
  loading(boolean) -
  // Functions:
  login(token, userData) -
  logout() -
  updateUser(userData);

// Usage: const { user, isAuthenticated, login, logout } = useAuth();
```

---

#### 📄 `frontend/src/pages/Dashboard.jsx`

**Lines:** 278 | **Size:** 11KB

**Contains:**

- User stats display (XP, Level, Streak)
- Recent entries list
- Quick action buttons
- DailyChallenges component
- statsAPI.getDashboard() integration

---

#### 📄 `frontend/src/pages/PomodoroTimer.jsx`

**Lines:** 477 | **Size:** 18KB

**Contains:**

- Timer display (25min work, 5min short break, 15min long break)
- Play/Pause/Reset controls
- Session tracking
- Auto-switch between work/break
- Sound notifications
- Today's stats
- Historical sessions

**Functions:**

```javascript
-fetchTodayStats() -
  handleStart() -
  handleReset() -
  handleTimerComplete() -
  handleCompleteSession() -
  autoSwitchSession() -
  switchSession(type) -
  playNotificationSound() -
  formatTime(seconds) -
  getSessionColor();
```

---

#### 📄 `frontend/src/pages/AIChat.jsx`

**Lines:** ~200 | **Size:** 8KB

**Contains:**

- Chat interface
- Message history
- AI prompt suggestions
- Mood analysis
- Goal planning

---

#### 📄 `frontend/src/pages/Goals.jsx`

**Lines:** ~280 | **Size:** 11KB

**Contains:**

- Goals list with filters
- Category tabs
- Progress bars
- Create goal button
- Delete goal functionality

---

#### 📄 `frontend/src/pages/Analytics.jsx`

**Lines:** ~350 | **Size:** 14KB

**Contains:**

- Mood trends chart (Recharts)
- Weekly activity chart
- Goal consistency tracking
- Stats summary cards

---

### Component Reference

| Component                | Size | Purpose                                |
| ------------------------ | ---- | -------------------------------------- |
| `Navbar.jsx`             | 6KB  | Navigation with mobile menu, user info |
| `DailyChallenges.jsx`    | 5KB  | Challenge cards with completion        |
| `Logo.jsx`               | 5KB  | Animated LUMIN logo                    |
| `Card.jsx`               | 2KB  | Reusable card wrapper                  |
| `Button.jsx`             | 2KB  | Styled button variants                 |
| `Input.jsx`              | 2KB  | Form input with label                  |
| `Modal.jsx`              | 1KB  | Modal/dialog component                 |
| `Badge.jsx`              | 1KB  | Badge display                          |
| `LevelBadge.jsx`         | 1KB  | Level indicator                        |
| `XPProgressBar.jsx`      | 1KB  | XP progress bar                        |
| `StreakFire.jsx`         | 1KB  | Streak fire animation                  |
| `Tabs.jsx`               | 1KB  | Tab navigation                         |
| `ThemeToggle.jsx`        | 1KB  | Light/Dark toggle                      |
| `AnimatedBackground.jsx` | 2KB  | Background effects                     |
| `AnimatedBorder.jsx`     | 1KB  | Animated borders                       |

---

## 🔑 Key Code Patterns

### API Call Pattern

```javascript
// All API calls follow this pattern
const result = await entryAPI.create(data);
if (result.success) {
  // Handle success
  console.log(result.data);
} else {
  // Handle error
  console.error(result.message);
}
```

### Protected Route Pattern

```javascript
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
}
```

### Data Fetching Pattern

```javascript
useEffect(() => {
  const fetchData = async () => {
    setLoading(true);
    const result = await api.getData();
    if (result.success) {
      setData(result.data);
    }
    setLoading(false);
  };
  fetchData();
}, []);
```

---

## 📊 File Size Summary

### Backend (Excluding node_modules)

- **Total Controllers:** 9 files, ~100KB
- **Total Models:** 8 files, ~30KB
- **Total Routes:** 9 files, ~20KB
- **Total estimated:** ~150KB

### Frontend (Excluding node_modules)

- **Total Pages:** 18 files, ~170KB
- **Total Components:** 16 files, ~35KB
- **Total Utils:** 1 file, ~23KB
- **Total estimated:** ~230KB

---

**This file is for code reference. See PROJECT_COMPLETE_INFO.md for features and status.**
