# 🌟 LUMIN - Complete Project Information

## 📋 Project Overview

**LUMIN** ek **Gamified Personal Journaling & Productivity App** hai jo users ko daily journaling, goal tracking, mood tracking, aur productivity features ke through self-improvement mein help karta hai.

### 🎯 Project Motive / Purpose:

1. **Personal Growth** - Daily journaling se self-reflection aur personal development
2. **Goal Achievement** - SMART goals set karna aur track karna
3. **Productivity** - Pomodoro timer se focus sessions
4. **Community** - Teams aur community feed se motivation
5. **AI Assistance** - Gemini AI se personalized guidance aur motivation
6. **Gamification** - XP, levels, badges, streaks se engagement badhana

---

## 🛠️ Tech Stack

### Frontend

| Technology       | Version | Purpose                 |
| ---------------- | ------- | ----------------------- |
| React            | 19.2.0  | UI Framework            |
| Vite             | 7.2.4   | Build Tool & Dev Server |
| Tailwind CSS     | 3.4.1   | Styling                 |
| React Router DOM | 7.10.1  | Routing                 |
| Recharts         | 3.6.0   | Charts & Analytics      |
| Lucide React     | 0.561.0 | Icons                   |
| React Icons      | 5.5.0   | Additional Icons        |

### Backend

| Technology            | Version | Purpose               |
| --------------------- | ------- | --------------------- |
| Node.js               | -       | Runtime               |
| Express               | 5.2.1   | Web Framework         |
| MongoDB               | -       | Database              |
| Mongoose              | 9.0.1   | ODM                   |
| JWT                   | 9.0.3   | Authentication        |
| bcryptjs              | 3.0.3   | Password Hashing      |
| @google/generative-ai | 0.21.0  | Gemini AI Integration |
| CORS                  | 2.8.5   | Cross-Origin Requests |
| dotenv                | 17.2.3  | Environment Variables |

---

## ✅ COMPLETED FEATURES

### 1. 🔐 Authentication System

- User Registration with validation
- User Login with JWT tokens
- Protected Routes
- Auth Context for state management

### 2. 📔 Journal Entries (CRUD)

- Create entries with mood, title, notes, tags, category
- View all entries with filters
- Edit/Update entries
- Delete entries
- XP awarded for entries

### 3. 😊 Mood Tracking

- 8 moods: amazing, happy, neutral, sad, angry, anxious, stressed, excited
- Mood emojis automatically assigned
- Mood intensity (1-10)
- Mood trends analytics

### 4. 🔥 Streak System

- Automatic streak calculation
- Streak bonus XP
- Last entry date tracking

### 5. ⭐ XP & Leveling System

- XP earned from entries, goals, challenges
- Level calculation based on XP
- Level progress tracking

### 6. 🏆 Badge System

- Automatic badge unlocking
- Multiple badge types (fire-starter, etc.)
- Badge display with earned date

### 7. 🎯 SMART Goals System

- Full CRUD for goals
- Categories: career, health, learning, finance, relationships, hobbies
- Priority levels: low, medium, high
- Milestones with individual XP rewards
- Progress tracking (current vs target value)
- Status: active, completed, abandoned, paused
- Virtual fields: progressPercentage, isOverdue, daysRemaining

### 8. 📋 Daily Challenges

- Generate daily challenges
- Complete challenges for XP
- Challenge history
- Challenge statistics

### 9. 📊 Dashboard

- User stats overview
- XP & level display
- Streak tracking
- Recent entries
- Quick actions

### 10. 📈 Analytics

- Mood trends charts
- Weekly activity
- Goal consistency
- Goal timeline

### 11. 🎨 Theme System

- Light/Dark mode toggle
- Theme Context
- Custom Tailwind theme colors

### 12. ⏱️ Pomodoro Timer (COMPLETE)

- 25-minute focus sessions
- 5-minute short breaks
- 15-minute long breaks
- Session tracking with API
- Auto-switch between work/break
- Sound notifications
- Today's stats display
- Historical session data

### 13. 🤖 AI Chat (Gemini Integration)

- AI-powered chatbot
- Mood analysis
- Goal planning assistance
- Habit suggestions
- Daily motivation
- Uses Gemini 1.5 Flash model

### 14. 👥 Community Feed

- Create posts
- Like/React to posts
- Comment on posts
- Delete own posts
- Feed types: all, following

### 15. 👨‍👩‍👧‍👦 Teams

- Create teams
- Join via invite code
- Team feed
- Team leaderboard
- Leave team

---

## ❌ PENDING FEATURES (TODO)

### High Priority

1. ❌ **Toast Notifications** - Replace `alert()` with react-hot-toast
2. ❌ **Search & Filters** - Entries page pe search/filter functionality
3. ❌ **Edit/Delete UI** - Entries list me visible action buttons
4. ❌ **Loading Skeletons** - Better loading states instead of spinners
5. ❌ **Confirmation Modals** - Delete confirmations

### Medium Priority

6. ❌ **Mood Distribution Pie Chart** - Analytics me mood breakdown
7. ❌ **Streak Calendar Heatmap** - GitHub-style activity calendar
8. ❌ **Enhanced Mood Trends** - Better visualizations
9. ❌ **Input Validation** - Client-side form validation

### Low Priority (Future)

10. ❌ **Vision Board** - Image upload via Cloudinary
11. ❌ **Profile Page** - User profile editing
12. ❌ **Email Notifications** - Daily reminders
13. ❌ **Mobile Responsiveness** - Better mobile experience
14. ❌ **PWA Support** - Progressive Web App

---

## 🐛 KNOWN ERRORS & ISSUES

### 🔴 Critical Issues

#### 1. Duplicate Code in `entryController.js`

- **Location:** Lines 81-115 and 117-189
- **Problem:** Challenge code runs BEFORE user is fetched, `user` variable used before defined
- **Impact:** Runtime errors possible

#### 2. Using `alert()` Instead of Toasts

- **Location:** Multiple pages (AddEntry.jsx, Register.jsx, etc.)
- **Problem:** Poor UX - blocking browser alerts
- **Solution:** Install react-hot-toast

### 🟡 Warnings

#### 1. Missing Error Handling

- Some API calls don't handle network errors
- No retry logic for failed requests
- Missing error boundaries in React

#### 2. Missing Input Validation

- No client-side validation
- No real-time feedback
- No character limits shown

### 🟢 Suggestions

#### 1. Gemini Model Update

- Currently using `gemini-pro` (deprecated)
- Should use `gemini-1.5-flash` (recommended)

---

## 🔧 UI IMPROVEMENTS NEEDED

### Design Improvements

1. **Better Loading States** - Skeleton loaders instead of spinners
2. **Micro-animations** - Subtle hover effects, transitions
3. **Dark Mode Refinement** - Better contrast, colors
4. **Mobile Navigation** - Bottom nav for mobile users
5. **Empty States** - Better UI when no data exists

### UX Improvements

1. **Form Validation Feedback** - Real-time error messages
2. **Action Confirmations** - Modal confirmations for destructive actions
3. **Success Feedback** - Toast notifications for actions
4. **Progress Indicators** - Clear progress for multi-step actions
5. **Keyboard Navigation** - Better accessibility

---

## 🚀 FEATURE ADVANCEMENT IDEAS

### AI Features

1. **Journal Analysis** - AI summarize weekly/monthly journals
2. **Mood Predictions** - Predict mood based on patterns
3. **Smart Goal Suggestions** - AI suggest goals based on entries
4. **Personalized Tips** - Daily tips based on user data

### Productivity Features

1. **Habit Tracker** - Daily habit tracking with streaks
2. **Focus Music** - Ambient sounds during Pomodoro
3. **Task Lists** - Simple to-do lists
4. **Calendar Integration** - Google/Outlook calendar sync

### Social Features

1. **Team Challenges** - Compete with team members
2. **Global Leaderboard** - Top users worldwide
3. **Mentorship** - Connect with mentors
4. **Sharing** - Share achievements on social media

### Analytics Features

1. **AI Insights** - AI-generated weekly reports
2. **Comparison Charts** - Compare current vs past performance
3. **Export Data** - PDF/CSV export
4. **Goal Forecasting** - Predict goal completion dates

---

## 📁 Environment Variables Required

### Backend (.env)

```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_jwt_secret
PORT=5000
NODE_ENV=development
GEMINI_API_KEY=your_gemini_api_key
```

### Frontend (optional)

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🏃 How to Run

### Backend

```bash
cd backend
npm install
npm run dev  # Development with nodemon
npm start    # Production
```

### Frontend

```bash
cd frontend
npm install
npm run dev  # Development server
npm run build  # Production build
```

---

## 📞 API Endpoints Summary

### Auth

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Entries

- `GET /api/entries` - Get all entries
- `POST /api/entries` - Create entry
- `GET /api/entries/:id` - Get single entry
- `PUT /api/entries/:id` - Update entry
- `DELETE /api/entries/:id` - Delete entry
- `GET /api/entries/today` - Today's entries

### Goals

- `GET /api/goals` - Get all goals
- `POST /api/goals` - Create goal
- `GET /api/goals/:id` - Get single goal
- `PUT /api/goals/:id` - Update goal
- `DELETE /api/goals/:id` - Delete goal
- `PATCH /api/goals/:id/progress` - Update progress
- `PATCH /api/goals/:goalId/milestones/:milestoneId` - Complete milestone
- `GET /api/goals/stats/overview` - Goal stats

### Stats

- `GET /api/stats/dashboard` - Dashboard data
- `GET /api/stats/mood-trends` - Mood trends
- `GET /api/stats/weekly-activity` - Weekly activity
- `GET /api/stats/goal-consistency` - Goal consistency
- `GET /api/stats/goal-timeline` - Goal timeline

### Challenges

- `GET /api/challenges/today` - Today's challenges
- `PATCH /api/challenges/:id/complete` - Complete challenge
- `GET /api/challenges/history` - Challenge history
- `GET /api/challenges/stats` - Challenge stats

### AI

- `GET /api/ai/prompts` - Get prompts
- `POST /api/ai/analyze-mood` - Analyze mood
- `POST /api/ai/plan-goal` - Plan goal with AI
- `POST /api/ai/suggest-habits` - Get habit suggestions
- `POST /api/ai/motivate` - Get motivation
- `POST /api/ai/chat` - Chat with AI

### Pomodoro

- `POST /api/pomodoro/start` - Start session
- `PATCH /api/pomodoro/:id/complete` - Complete session
- `GET /api/pomodoro` - Get all sessions
- `GET /api/pomodoro/today` - Today's sessions
- `GET /api/pomodoro/stats` - Pomodoro stats
- `DELETE /api/pomodoro/:id` - Delete session

### Posts (Community)

- `POST /api/posts` - Create post
- `GET /api/posts/feed` - Get feed
- `GET /api/posts/my-posts` - Get own posts
- `POST /api/posts/:id/react` - React to post
- `DELETE /api/posts/:id/react` - Remove reaction
- `POST /api/posts/:id/comment` - Add comment
- `DELETE /api/posts/:id/comment/:commentId` - Delete comment
- `DELETE /api/posts/:id` - Delete post

### Teams

- `POST /api/teams` - Create team
- `GET /api/teams/my-teams` - Get my teams
- `GET /api/teams/:id` - Get team details
- `POST /api/teams/join` - Join team
- `POST /api/teams/:id/leave` - Leave team
- `GET /api/teams/:id/feed` - Team feed
- `GET /api/teams/:id/leaderboard` - Team leaderboard
- `DELETE /api/teams/:id` - Delete team

---

## 📝 Notes for Next AI Session

1. **Tech Stack:** React 19 + Vite + Tailwind + Express + MongoDB + JWT + Gemini AI
2. **State Management:** React Context (AuthContext, ThemeContext)
3. **API Pattern:** Centralized in `frontend/src/utils/api.js`
4. **Styling:** Tailwind CSS with custom theme
5. **Code Style:** Functional components with hooks
6. **Gamification:** XP/Level/Badge logic in `backend/utils/gamification.js`

---

**Last Updated:** January 4, 2025  
**Project Status:** In Active Development  
**Version:** 1.0.0
