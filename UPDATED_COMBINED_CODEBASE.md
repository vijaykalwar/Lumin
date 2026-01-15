# 📦 LUMIN - COMPLETE CODEBASE REFERENCE

> **NOTE FOR AI:** This file contains the critical source code of the LUMIN project. Use this context to understand the system architecture, database schemas, and API patterns.

---

## 🛠️ BACKEND STRUCTURE

### `backend/server.js`

```javascript
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
dotenv.config();
connectDB();
const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/entries", require("./routes/entries")); // & /api/stats
app.use("/api/goals", require("./routes/goals"));
app.use("/api/ai", require("./routes/ai"));
app.use("/api/pomodoro", require("./routes/pomodoro"));
app.use("/api/posts", require("./routes/posts"));
app.use("/api/teams", require("./routes/teams"));

app.get("/", (req, res) => res.json({ status: "running", version: "1.0.0" }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

---

## 🗄️ DATABASE MODELS (Mongoose)

### `backend/models/User.js`

```javascript
const mongoose = require("mongoose");
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    // Gamification
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    streak: { type: Number, default: 0 },
    lastEntryDate: Date,
    badges: [
      {
        name: String,
        displayName: String,
        earnedAt: Date,
        xpAwarded: Number,
      },
    ],
    settings: {
      emailNotifications: { type: Boolean, default: true },
      dailyReminder: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("User", userSchema);
```

### `backend/models/Entry.js`

```javascript
const mongoose = require("mongoose");
const entrySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    mood: {
      type: String,
      required: true,
      enum: [
        "amazing",
        "happy",
        "neutral",
        "sad",
        "angry",
        "anxious",
        "stressed",
        "excited",
      ],
    },
    moodEmoji: String,
    moodIntensity: { type: Number, min: 1, max: 10 },
    title: String,
    notes: { type: String, required: true },
    tags: [String],
    category: { type: String, default: "personal" },
    location: {
      enabled: Boolean,
      coordinates: { lat: Number, lng: Number },
      placeName: String,
    },
    isPrivate: { type: Boolean, default: true },
    wordCount: { type: Number, default: 0 },
    entryDate: { type: Date, default: Date.now },
    xpAwarded: { type: Number, default: 0 },
  },
  { timestamps: true }
);

entrySchema.pre("save", function () {
  if (this.notes) this.wordCount = this.notes.trim().split(/\s+/).length;
});
module.exports = mongoose.model("Entry", entrySchema);
```

### `backend/models/Goal.js`

```javascript
const mongoose = require("mongoose");
const goalSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: String,
    metric: String,
    targetValue: Number,
    currentValue: { type: Number, default: 0 },
    unit: String,
    category: { type: String, required: true },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["active", "completed", "abandoned", "paused"],
      default: "active",
    },
    targetDate: Date,
    milestones: [
      {
        title: String,
        targetValue: Number,
        completed: Boolean,
        xpReward: Number,
      },
    ],
    xpReward: { type: Number, default: 200 },
  },
  { timestamps: true }
);

goalSchema.virtual("progressPercentage").get(function () {
  return this.targetValue
    ? Math.min(Math.round((this.currentValue / this.targetValue) * 100), 100)
    : 0;
});
module.exports = mongoose.model("Goal", goalSchema);
```

### `backend/models/PomodoroSession.js`

```javascript
const mongoose = require("mongoose");
const pomodoroSessionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["focus", "short-break", "long-break"],
      default: "focus",
    },
    duration: { type: Number, default: 25 },
    completed: { type: Boolean, default: false },
    xpAwarded: { type: Number, default: 0 },
    linkedGoal: { type: mongoose.Schema.Types.ObjectId, ref: "Goal" },
  },
  { timestamps: true }
);

pomodoroSessionSchema.methods.completeSession = function () {
  this.completed = true;
  this.xpAwarded = this.type === "focus" ? 40 : 10;
};
module.exports = mongoose.model("PomodoroSession", pomodoroSessionSchema);
```

### `backend/models/Challenge.js`

```javascript
const mongoose = require("mongoose");
const challengeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true },
    challenges: [
      {
        type: { type: String, required: true },
        title: String,
        target: Number,
        progress: { type: Number, default: 0 },
        completed: { type: Boolean, default: false },
        xpReward: Number,
      },
    ],
    totalXPEarned: { type: Number, default: 0 },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Challenge", challengeSchema);
```

---

## ⚙️ CORE LOGIC (Controllers & Utils)

### `backend/utils/gamification.js`

```javascript
// XP & Level Logic
exports.calculateXP = (entry) => {
  let base = 50,
    bonus = 0;
  if (entry.wordCount >= 100) bonus += 25;
  if (entry.tags?.length >= 3) bonus += 10;
  return { base, bonus, total: base + bonus };
};

exports.calculateLevel = (xp) => {
  const levels = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500, 5500];
  for (let i = levels.length - 1; i >= 0; i--)
    if (xp >= levels[i]) return i + 1;
  return 1;
};

exports.updateStreak = async (userId) => {
  // Logic to calculate streak based on lastEntryDate
  // Returns { currentStreak, streakChanged, bonusXP, message }
};
```

### `backend/controllers/entryController.js` (Key Logic Only)

```javascript
// NOTE: Contains duplicate code bug in original file
exports.createEntry = async (req, res) => {
  try {
    const { mood, notes } = req.body;
    // ... Validation ...
    const entry = await Entry.create({ ...req.body, user: req.user._id });
    const user = await User.findById(req.user._id);

    // Gamification
    const xpResult = calculateXP(entry);
    entry.xpAwarded = xpResult.total;
    await entry.save();

    user.xp += xpResult.total;
    // Streak update logic...
    user.level = calculateLevel(user.xp);

    await user.save();
    res
      .status(201)
      .json({ success: true, data: { entry, rewards: { xp: xpResult } } });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
```

### `backend/controllers/aiController.js`

```javascript
// Uses Gemini API via service
exports.chat = async (req, res) => {
  // ... Code to chat with AI using user stats context ...
};
```

### `backend/controllers/pomodoroController.js`

```javascript
exports.completeSession = async (req, res) => {
  const session = await PomodoroSession.findById(req.params.id);
  session.completeSession();
  await session.save();

  const user = await User.findById(req.user._id);
  user.xp += session.xpAwarded;
  await user.save();

  res
    .status(200)
    .json({ success: true, data: { xpEarned: session.xpAwarded } });
};
```

---

## 🎨 FRONTEND CORE

### `frontend/src/App.jsx`

```javascript
// Routing Map
import { Routes, Route } from "react-router-dom";
// ... Imports ...

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/entries"
        element={
          <ProtectedRoute>
            <Entries />
          </ProtectedRoute>
        }
      />
      <Route
        path="/goals"
        element={
          <ProtectedRoute>
            <Goals />
          </ProtectedRoute>
        }
      />
      <Route
        path="/pomodoro"
        element={
          <ProtectedRoute>
            <PomodoroTimer />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ai-chat"
        element={
          <ProtectedRoute>
            <AIChat />
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <Analytics />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}
```

### `frontend/src/utils/api.js` (The Nervous System)

```javascript
const API_BASE_URL = "http://localhost:5000/api";
const getHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export const entryAPI = {
  create: (data) =>
    fetch(`${API_BASE_URL}/entries`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then((r) => r.json()),
  getAll: (filters) =>
    fetch(`${API_BASE_URL}/entries?...`, { headers: getHeaders() }).then((r) =>
      r.json()
    ),
  // ... update, delete
};

export const goalsAPI = {
  /* CRUD */
};
export const pomodoroAPI = {
  /* start, complete, stats */
};
export const aiAPI = {
  /* chat, analyzeMood */
};
export const authAPI = {
  /* login, register */
};
```

### `frontend/src/contexts/AuthContext.jsx`

```javascript
// Manages User State
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // login, register, logout functions...
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
```

---

**End of Codebase Reference**
