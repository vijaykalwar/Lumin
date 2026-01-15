# 🧠 LUMIN - MASTER CONTEXT FOR AI

## 📂 FILES TO SHARE (Priority Order)

### 1. Must Share (Critical Context)

- `frontend/src/utils/api.js` (All 9 API modules - Central nervous system)
- `frontend/src/App.jsx` (Routing structure - 18+ routes)
- `backend/server.js` (Server entry & route map)
- **Current Task File:** The specific file you are editing.

### 2. Feature-Specific Sets

| Feature          | Frontend Files                                  | Backend Files                                 |
| ---------------- | ----------------------------------------------- | --------------------------------------------- |
| **Entries**      | `AddEntry.jsx`, `Entries.jsx`                   | `entryController.js`, `Entry.js`              |
| **Goals**        | `Goals.jsx`, `CreateGoal.jsx`, `GoalDetail.jsx` | `goalController.js`, `Goal.js`                |
| **Pomodoro**     | `PomodoroTimer.jsx`                             | `pomodoroController.js`, `PomodoroSession.js` |
| **AI/Chat**      | `AIChat.jsx`                                    | `aiController.js`, `ai.js`                    |
| **Gamification** | `Navbar.jsx` (Stats), `DailyChallenges.jsx`     | `gamification.js`, `challengeService.js`      |

---

## 📌 PROJECT IDENTITY

**Name:** LUMIN
**Type:** Gamified Personal Journaling & Productivity Web App
**Tech Stack:**

- **Frontend:** React 19, Vite, Tailwind CSS, Recharts, Lucide Icons, Context API (Auth/Theme).
- **Backend:** Node.js, Express 5, MongoDB (Mongoose), Custom JWT Auth.
- **AI:** Google Gemini API (Model: `gemini-1.5-flash`).

---

## 🏗️ DATA MODELS (Concise Schemas)

### 👤 User (`User.js`)

- **Core:** `name`, `email`, `password`
- **Gamification:** `xp` (default 0), `level` (default 1), `streak` (current streak), `badges` (array of unlocked badges).
- **Settings:** `dailyReminder`, `emailNotifications`.

### 📔 Entry (`Entry.js`)

- **Content:** `title`, `notes` (10-5000 chars), `tags` [].
- **Mood:** `mood` (enum: amazing, happy, neutral, sad, angry, anxious, stressed, excited), `moodIntensity` (1-10).
- **Meta:** `wordCount` (auto-calc), `location`, `isPrivate`, `xpAwarded`.

### 🎯 Goal (`Goal.js`) - SMART Goals

- **Structure:** `title`, `description`, `category` (career, health, etc.), `priority`.
- **Tracking:** `targetValue`, `currentValue`, `unit`, `deadline`.
- **Milestones:** Array of `{ title, target, completed, xpReward }`.
- **Status:** active, completed, abandoned.

### 🍅 Pomodoro (`PomodoroSession.js`)

- **Types:** focus (25m), short-break (5m), long-break (15m).
- **Data:** `duration`, `completed`, `xpAwarded`, `linkedGoal` (optional).

### ⚔️ Challenge (`Challenge.js`)

- **Daily:** Generates 3 random challenges/day per user.
- **Types:** `word-count` (write X words), `early-bird` (<9am), `tag-master`, `streak-keeper`.
- **Reward:** XP per challenge + Bonus for all 3.

---

## ⚙️ BUSINESS LOGIC & RULES

### 🎮 Gamification Engine (`gamification.js`)

1. **XP Calculation:**
   - **Base Entry:** +50 XP
   - **Detailed (>100 words):** +25 XP
   - **Tags (3+):** +10 XP
   - **Challenges:** +40-80 XP each
2. **Leveling:** Levels calculated by XP thresholds (Lvl 1=0, Lvl 2=100, Lvl 5=1500...).
3. **Streak System:**
   - Increments on consecutive days.
   - Resets if >1 day gap.
   - **Bonuses:** 3-day (+100 XP), 7-day (+250 XP), 30-day (+1000 XP).

### 🤖 AI Integration Rules (`aiController.js`)

- **Chat:** Maintains conversation context with User stats (XP, active goals, recent mood).
- **Mood Analysis:** Analyzes last 7 days entries for patterns.
- **Motivation:** Context-aware quotes (e.g., if streak is low, gives encouragement).

---

## 🛣️ API ARCHITECTURE (`api.js`)

Total **9 Modules** handling all requests:

1. `authAPI` (Register/Login)
2. `entryAPI` (CRUD, Today's entries)
3. `statsAPI` (Dashboard nums, Mood trends, Goal consistency)
4. `goalsAPI` (CRUD, Milestones, Progress update)
5. `challengesAPI` (Daily fetch, Complete)
6. `aiAPI` (Chat, Prompts, Analysis)
7. `pomodoroAPI` (Timer sessions)
8. `postsAPI` (Community feed, likes, comments)
9. `teamsAPI` (Groups, Leaderboards)

---

## 🚧 CURRENT PROJECT STATUS

### ✅ Completed Features

- Full Auth & Protected Routes.
- Functional Journaling (Tags, Moods, Dates).
- Complete Gamification (XP, Levels, Badges, Streaks UI).
- SMART Goals with progress tracking.
- Pomodoro Timer with audio notifications.
- AI Chatbot & Mood Analysis.
- Community Teams & Feeds.

### ❌ Pending TODOs (Prioritized)

1. **UI/UX Polish:** Replace `alert()` with **Toast Notifications** (React Hot Toast).
2. **Search:** Add search bar & filters to Entries page.
3. **Control:** Add Edit/Delete buttons to Entry cards.
4. **Visuals:** Add Mood Distribution Pie Chart & Streak Heatmap.
5. **Safety:** Add Delete Confirmation Modals.
6. **Performance:** Replace spinners with Skeleton Loaders.

### 🐛 Known Bugs to Fix

1. **Critical:** `backend/controllers/entryController.js` has **duplicate code** (lines 81-115 repeat logic).
2. **Optimization:** AI Service is using `gemini-pro` (deprecated). Switch to `gemini-1.5-flash`.
3. **UX:** Forms lack client-side validation messages.

---

_Generated for seamless AI handoff. Last Updated: Jan 2026._
