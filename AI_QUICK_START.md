# 🚀 LUMIN - Quick Start for Claude AI

Copy-paste this entire message to start a new Claude AI session:

---

## Hi Claude! I need help continuing work on my LUMIN project.

### 🎯 What is LUMIN?

A **Gamified Personal Journaling & Productivity App** with:

- Journal entries + Mood tracking (8 moods)
- SMART Goals with milestones
- XP, Levels, Badges, Streaks (gamification)
- Pomodoro Timer
- AI Chat (Gemini)
- Community Feed + Teams

### 🛠️ Tech Stack

- **Frontend:** React 19 + Vite + Tailwind CSS
- **Backend:** Express 5 + MongoDB/Mongoose
- **Auth:** JWT tokens
- **AI:** Google Gemini API

### ✅ Already Completed

1. Full Auth (Register/Login)
2. Journal Entries CRUD
3. Mood Tracking (8 moods + intensity)
4. Streak System
5. XP & Level System
6. Badge System
7. SMART Goals (with milestones)
8. Daily Challenges
9. Dashboard with stats
10. Analytics (charts)
11. Theme (Light/Dark)
12. Pomodoro Timer
13. AI Chat (Gemini)
14. Community Feed
15. Teams

### ❌ TODO / Pending

1. Toast notifications (replace alert())
2. Search/Filter on entries
3. Edit/Delete buttons on entries list
4. Loading skeletons
5. Confirmation modals
6. Mood pie chart
7. Streak heatmap calendar

### 🐛 Known Bugs

1. `entryController.js` has duplicate code (lines 81-115 repeat)
2. Using deprecated `gemini-pro` instead of `gemini-1.5-flash`

### 📂 Key Files to Know

- **API calls:** `frontend/src/utils/api.js` (all 9 API modules)
- **Routes:** `frontend/src/App.jsx` (all routes defined)
- **Auth:** `frontend/src/contexts/AuthContext.jsx`
- **Models:** `backend/models/` (User, Entry, Goal, Challenge, etc.)
- **Gamification:** `backend/utils/gamification.js`

### 🔧 Code Patterns

```javascript
// API calls
const result = await entryAPI.create(data);
if (result.success) {
  /* success */
}

// Protected routes
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>;

// State management - React Context
const { user, isAuthenticated } = useAuth();
```

### 📝 Please Help Me With:

[DESCRIBE WHAT YOU NEED HELP WITH HERE]

### 📎 I've attached key files:

[LIST FILES YOU'RE SHARING]

---

## Files to Share (Priority Order)

### Must Share (Minimum)

1. `frontend/src/utils/api.js` - All API calls
2. `frontend/src/App.jsx` - Routes
3. `backend/server.js` - Server setup
4. The specific files you're working on

### Share If Working On Features

- **Entries:** `frontend/src/pages/AddEntry.jsx`, `Entries.jsx`, `backend/controllers/entryController.js`
- **Goals:** `frontend/src/pages/Goals.jsx`, `CreateGoal.jsx`, `GoalDetail.jsx`, `backend/controllers/goalController.js`
- **Pomodoro:** `frontend/src/pages/PomodoroTimer.jsx`, `backend/controllers/pomodoroController.js`
- **AI:** `frontend/src/pages/AIChat.jsx`, `backend/controllers/aiController.js`

### Share For Context

- `PROJECT_COMPLETE_INFO.md` - Full project overview
- `FILE_STRUCTURE_CODE_REFERENCE.md` - All file details
- `ERRORS_AND_SOLUTIONS.md` - Known issues

---

## Example Messages

### For Bug Fixes:

```
Hi Claude! In my LUMIN project, there's a bug in entryController.js where
the challenge code runs before user is fetched. Please fix the duplicate
code issue in lines 81-115. Here's the file: [paste file]
```

### For New Features:

```
Hi Claude! I want to add toast notifications to my LUMIN project (replace
all alert() calls). I'm using React + Tailwind. Please help me implement
react-hot-toast. Here are my current files: [paste files]
```

### For UI Improvements:

```
Hi Claude! I need to improve the UI of my Entries page in LUMIN. Currently
it just shows a list, but I want search/filter functionality and visible
edit/delete buttons. Here's the current code: [paste file]
```

---

**Last Updated:** January 4, 2025
