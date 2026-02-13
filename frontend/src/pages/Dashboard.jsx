import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import BottomNav from '../components/BottomNav';
import { statsAPI, goalsAPI } from '../utils/api';
import { Target, BookOpen, Plus } from 'lucide-react';
import { showToast } from '../utils/toast';
import React from 'react';

// New Dashboard Components
import LevelProgressCard from '../components/LevelProgressCard';
import StatsGrid from '../components/StatsGrid';
import WeeklyActivityChart from '../components/WeeklyActivityChart';
import StreakDisplay from '../components/StreakDisplay';
import MoodPicker from '../components/MoodPicker';
import AICoachCard from '../components/AICoachCard';
import BadgeSystem from '../components/BadgeSystem';
import EnhancedGoalCard from '../components/EnhancedGoalCard';
import FloatingActionButton from '../components/FloatingActionButton';
import { celebrate } from '../utils/celebrations';

function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [weeklyActivity, setWeeklyActivity] = useState([]);
  const [activeGoals, setActiveGoals] = useState([]);
  const [updatingGoalId, setUpdatingGoalId] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Try to load from cache first
    const cached = localStorage.getItem('dashboardCache');
    if (cached) {
      try {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < 300000) { // 5 min cache
          setDashboardData(data);
          setLoading(false);
          fetchGoalsOnly();
          return;
        }
      } catch (e) {
        console.error('Cache parse error:', e);
      }
    }
    fetchDashboardData();
  }, []);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchGoalsOnly = async () => {
    const res = await goalsAPI.getAll({ status: 'active', limit: 10 });
    if (res.success && res.data?.goals) setActiveGoals(res.data.goals);
    else if (res.success && Array.isArray(res.data)) setActiveGoals(res.data);
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    const [dashResult, weeklyResult, goalsRes] = await Promise.all([
      statsAPI.getDashboard(),
      statsAPI.getWeeklyActivity(),
      goalsAPI.getAll({ status: 'active', limit: 10 })
    ]);

    if (dashResult.success) {
      setDashboardData(dashResult.data);
      localStorage.setItem('dashboardCache', JSON.stringify({
        data: dashResult.data,
        timestamp: Date.now()
      }));
    }
    if (weeklyResult.success) setWeeklyActivity(weeklyResult.data);
    if (goalsRes.success && goalsRes.data?.goals) setActiveGoals(goalsRes.data.goals);
    else if (goalsRes.success && Array.isArray(goalsRes.data)) setActiveGoals(goalsRes.data);

    setLoading(false);
  };

  const handleUpdateProgress = async (goalId, currentValue, addAmount) => {
    if (!goalId || addAmount <= 0) return;
    const newValue = (currentValue || 0) + addAmount;
    setUpdatingGoalId(goalId);
    const res = await goalsAPI.updateProgress(goalId, newValue);
    setUpdatingGoalId(null);
    if (res.success) {
      showToast.success('Progress updated!');
      fetchGoalsOnly();
      const goal = res.data;
      if (goal.status === 'completed' && goal.currentValue >= goal.targetValue) {
        celebrate('goal', { playSound: true });
        showToast.success('🎉 Goal Completed! Amazing work!');
      }
    } else {
      showToast.error(res.message || 'Update failed');
    }
  };

  const handleMoodSelect = (mood) => {
    showToast.success(`Mood selected: ${mood.label}`);
    // Navigate to journal with mood pre-selected
    navigate('/journal', { state: { selectedMood: mood.id } });
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Navbar />
        <div className="pt-20 pb-24 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto animate-pulse space-y-6">
            <div className="h-12 w-64 bg-gray-200 dark:bg-gray-800 rounded-xl" />
            <div className="grid lg:grid-cols-[2fr_1fr] gap-6">
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-48 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800"
                  />
                ))}
              </div>
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-64 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Extract data
  const userData = dashboardData?.user || user;
  const statsOverview = dashboardData?.stats || {};
  const recentEntries = dashboardData?.recentEntries || [];

  // Calculate stats
  const level = userData?.level || 1;
  const currentXP = userData?.xp || 0;
  const totalXP = userData?.totalXP || currentXP;
  const currentStreak = userData?.streak || 0;
  const bestStreak = userData?.bestStreak || currentStreak;
  const totalEntries = statsOverview?.totalEntries || 0;
  const focusSessions = statsOverview?.totalSessions || 0;
  const focusHours = Math.floor((statsOverview?.totalHours || 0));

  const displayName = userData?.name || user?.name || 'there';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />

      <div className="pt-20 pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-6">

          {/* Welcome Header */}
          <div className="space-y-4 animate-fadeIn">
            <h1 className="font-display font-bold text-3xl md:text-4xl text-gray-900 dark:text-white">
              Welcome back, <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">{displayName}</span>! 👋
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              {currentStreak > 0 
                ? `${currentStreak} day streak! Keep it going! 🔥` 
                : "Start your streak today! 🚀"}
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/goals"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-lg"
              >
                <Plus className="w-4 h-4" />
                Create Goal
              </Link>
              <Link
                to="/journal"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white font-semibold rounded-xl hover:border-purple-500 dark:hover:border-purple-500 transition-colors"
              >
                <BookOpen className="w-4 h-4" />
                Journal
              </Link>
            </div>
          </div>

          {/* Main Grid Layout - 2 Columns on Large Screens */}
          <div className="grid lg:grid-cols-[2fr_1fr] gap-6">

            {/* LEFT COLUMN - Main Content */}
            <div className="space-y-6">

              {/* 1. Level Progress Card */}
              <LevelProgressCard
                level={level}
                currentXP={currentXP}
                totalXP={totalXP}
              />

              {/* 2. Stats Grid (4 cards) */}
              <StatsGrid
                currentStreak={currentStreak}
                totalEntries={totalEntries}
                focusSessions={focusSessions}
                focusHours={focusHours}
              />

              {/* 3. Weekly Activity Chart */}
              <WeeklyActivityChart weeklyData={weeklyActivity} />

              {/* 4. Active Goals */}
              <div className="card-glass p-6 space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Target className="w-5 h-5 text-purple-500" />
                    Active Goals
                  </h3>
                  <Link
                    to="/goals"
                    className="text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium"
                  >
                    View all →
                  </Link>
                </div>

                {activeGoals.length === 0 ? (
                  <div className="text-center py-12">
                    <Target className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-3 opacity-50" />
                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">
                      No active goals yet
                    </p>
                    <Link
                      to="/goals"
                      className="inline-block text-sm text-purple-600 hover:underline font-medium"
                    >
                      Create your first goal →
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activeGoals.slice(0, 3).map((goal) => (
                      <EnhancedGoalCard
                        key={goal._id}
                        goal={goal}
                        onUpdateProgress={handleUpdateProgress}
                        isUpdating={updatingGoalId === goal._id}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* 5. Recent Journal Entries */}
              <div className="card-glass p-6 space-y-4 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-500" />
                    Recent Journal
                  </h3>
                  <Link
                    to="/entries"
                    className="text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium"
                  >
                    View all →
                  </Link>
                </div>

                {recentEntries.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      No journal entries yet
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentEntries.slice(0, 2).map((entry) => (
                      <Link
                        key={entry._id}
                        to={`/entries/${entry._id}`}
                        className="block p-3 bg-gray-50 dark:bg-gray-800 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{entry.moodEmoji || '📝'}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {entry.title || 'Untitled Entry'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(entry.entryDate || entry.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* RIGHT SIDEBAR */}
            <div className="space-y-6">

              {/* 6. Streak Display */}
              <StreakDisplay
                currentStreak={currentStreak}
                bestStreak={bestStreak}
                weeklyActivity={weeklyActivity}
                size="lg"
              />

              {/* 7. Mood Picker */}
              <MoodPicker onMoodSelect={handleMoodSelect} />

              {/* 8. AI Coach Card */}
              <AICoachCard streak={currentStreak} />

              {/* 9. Badges (max 3) */}
              <div className="card-glass p-6 animate-fadeIn">
                <BadgeSystem
                  userStats={{
                    totalEntries: totalEntries,
                    currentStreak: currentStreak,
                    totalGoals: activeGoals.length,
                    completedGoals: 0,
                    totalXP: currentXP
                  }}
                  unlockedBadges={userData?.badges || []}
                />
                <Link
                  to="/achievements"
                  className="mt-4 block w-full text-center py-2 text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-medium"
                >
                  View All Badges →
                </Link>
              </div>

            </div>

          </div>

        </div>
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton />

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}

export default Dashboard;