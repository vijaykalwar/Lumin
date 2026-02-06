import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import { statsAPI } from '../utils/api';
import {BookOpen,Target,TrendingUp,Award,Flame,PlusCircle,Clock} from 'lucide-react';
import { showToast } from '../utils/toast';
import React, { Suspense } from 'react';

const DailyChallenges = React.lazy(() => import('../components/DailyChallenges'));

// ✨ Animated Counter
const AnimatedCounter = ({ value, duration = 1000 }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const numValue = parseInt(value) || 0;
    if (numValue === 0) { setCount(0); return; }
    const steps = 50;
    const increment = numValue / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      current >= numValue ? (setCount(numValue), clearInterval(timer)) : setCount(Math.floor(current));
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value, duration]);
  return <span>{count.toLocaleString()}</span>;
};

// 📅 Heatmap
const StreakHeatmap = ({ weeklyActivity = [] }) => {
  const getColor = (e) => e === 0 ? 'bg-gray-100 dark:bg-gray-800' : e <= 1 ? 'bg-purple-200 dark:bg-purple-900' : e <= 2 ? 'bg-purple-400 dark:bg-purple-700' : 'bg-purple-600 dark:bg-purple-500';
  const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  return (
    <div className="grid grid-cols-7 gap-1">
      {days.map((day, i) => (
        <div key={i} className="text-center">
          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{day}</div>
          <div className={`w-8 h-8 rounded-lg ${getColor(weeklyActivity[i]?.entries || 0)} transition-all hover:scale-110 cursor-pointer`} title={`${weeklyActivity[i]?.entries || 0} entries`} />
        </div>
      ))}
    </div>
  );
};

function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMood, setSelectedMood] = useState(null);
  const [aiAdvice, setAiAdvice] = useState(null);
  const [weeklyActivity, setWeeklyActivity] = useState([]);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const cached = localStorage.getItem('dashboardCache');
    if (cached) {
      try {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < 300000) {
          setDashboardData(data);
          setLoading(false);
          return;
        }
      } catch (e) {}
    }
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    const [dashResult, weeklyResult] = await Promise.all([
      statsAPI.getDashboard(),
      statsAPI.getWeeklyActivity()
    ]);
    if (dashResult.success) {
      setDashboardData(dashResult.data);
      localStorage.setItem('dashboardCache', JSON.stringify({ data: dashResult.data, timestamp: Date.now() }));
    }
    if (weeklyResult.success) setWeeklyActivity(weeklyResult.data);
    setLoading(false);
  };

  const handleMoodSelect = async (mood) => {
    setSelectedMood(mood);
    showToast.success(`Mood: ${mood}`);
    const result = await aiAPI.getMotivation({ situation: `feeling ${mood}` });
    if (result.success) setAiAdvice(result.data.motivation);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900">
        <Navbar />
        <div className="p-4 sm:p-6 lg:p-8"><div className="max-w-7xl mx-auto animate-pulse space-y-6">
          <div className="h-12 w-64 bg-gray-300 dark:bg-gray-700 rounded-xl" />
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">{[1,2,3].map(i => <div key={i} className="h-48 bg-gray-300 dark:bg-gray-700 rounded-2xl" />)}</div>
            <div className="space-y-4">{[1,2].map(i => <div key={i} className="h-64 bg-gray-300 dark:bg-gray-700 rounded-2xl" />)}</div>
          </div>
        </div></div>
      </div>
    );
  }

  const userData = dashboardData?.user || user;
  const statsOverview = dashboardData?.stats || {};
  const recentEntries = dashboardData?.recentEntries || [];
  const progressData = dashboardData?.progress || {};

  const moods = [
    { emoji: '😊', label: 'HAPPY', color: 'from-yellow-400 to-orange-400' },
    { emoji: '😌', label: 'CALM', color: 'from-blue-400 to-cyan-400' },
    { emoji: '🤔', label: 'THOUGHTFUL', color: 'from-purple-400 to-pink-400' },
    { emoji: '�', label: 'FRUSTRATED', color: 'from-red-400 to-orange-400' },
    { emoji: '😢', label: 'SAD', color: 'from-gray-400 to-blue-400' },
    { emoji: '😴', label: 'TIRED', color: 'from-indigo-400 to-purple-400' },
    { emoji: '�', label: 'MOTIVATED', color: 'from-green-400 to-emerald-400' },
    { emoji: '😰', label: 'ANXIOUS', color: 'from-pink-400 to-rose-400' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900">
      <Navbar />
      
      <div className="p-4 sm:p-6 lg:p-8 pb-24 max-w-7xl mx-auto">
        
        {/* 🎯 Header with Orbitron */}
        <div className="flex items-center justify-between mb-8 animate-fadeIn">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-white mb-2" style={{ fontFamily: 'Orbitron, sans-serif' }}>
              Welcome back, <span className="gradient-text">{user?.name}</span>! 👋
            </h1>
            <p className="text-gray-600 dark:text-gray-400">Start your streak today! 🎯</p>
          </div>
          <div className="hidden sm:flex gap-3">
            <Link to="/create-goal" className="btn-primary flex items-center gap-2 text-sm"><PlusCircle className="w-4 h-4" />CREATE GOAL</Link>
            <Link to="/add-entry" className="btn-secondary flex items-center gap-2 text-sm"><BookOpen className="w-4 h-4" />Journal</Link>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          
          {/* ═══════════ LEFT (2 cols) ═══════════ */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* ✨ Level Progress */}
            <div className="card-glass animate-scaleIn">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xl font-black text-white shadow-xl" style={{ fontFamily: 'Orbitron, sans-serif', boxShadow: '0 0 20px rgba(168, 85, 247, 0.5)' }}>
                      {userData?.level || 1}
                    </div>
                    <Star className="absolute -bottom-1 -right-1 w-5 h-5 text-yellow-400 fill-yellow-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white" style={{ fontFamily: 'Orbitron, sans-serif' }}>Level Progress</h3>
                    <p className="text-sm text-gray-500">Level {userData?.level}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 text-yellow-500 text-sm"><Zap className="w-4 h-4" /><span className="font-bold">{progressData?.xpForNextLevel || 100} XP to next</span></div>
                  <p className="text-2xl font-black text-gray-900 dark:text-white" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                    <AnimatedCounter value={userData?.xp || 0} /> / {progressData?.nextLevelXP || 150}
                  </p>
                </div>
              </div>
              <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="xp-bar-shimmer h-full rounded-full transition-all duration-1000" style={{ width: `${progressData?.xpProgress || 0}%` }} />
              </div>
              <p className="text-xs text-gray-500 text-right mt-1">{Math.round(progressData?.xpProgress || 0)}%</p>
            </div>

            {/* 📊 Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 animate-fadeIn">
              {[
                { label: 'Streak', value: userData?.streak || 0, icon: Flame, color: 'orange', glow: '0 0 30px rgba(251, 146, 60, 0.2)' },
                { label: 'Entries', value: statsOverview?.totalEntries || 0, icon: BookOpen, color: 'purple', glow: '0 0 30px rgba(168, 85, 247, 0.2)' },
                { label: 'Sessions', value: 0, icon: Target, color: 'cyan', glow: '0 0 30px rgba(34, 211, 238, 0.2)' },
                { label: 'Hours', value: 0, icon: Clock, color: 'green', glow: '0 0 30px rgba(34, 197, 94, 0.2)' }
              ].map((stat, i) => (
                <div key={i} className={`card-glass group hover:scale-105 transition-all cursor-default`} style={{ '--hover-glow': stat.glow }}>
                  <div className="flex flex-col items-center text-center">
                    <div className={`p-2.5 bg-${stat.color}-100 dark:bg-${stat.color}-900/30 rounded-xl mb-2 group-hover:shadow-lg transition-shadow`}>
                      <stat.icon className={`w-5 h-5 text-${stat.color}-500`} />
                    </div>
                    <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">{stat.label}</h4>
                    <p className="text-2xl font-black text-gray-900 dark:text-white" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                      <AnimatedCounter value={stat.value} />
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* 📈 Weekly Chart */}
            <div className="card-glass animate-fadeIn">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                  <TrendingUp className="w-5 h-5 text-purple-500" />Weekly Activity
                </h3>
                <span className="text-xs px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full font-bold">Focus</span>
              </div>
              <div className="flex items-end justify-between gap-2 h-40">
                {['Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu'].map((day, i) => {
                  const height = Math.min((weeklyActivity[i]?.entries || 0) * 25, 120);
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div className="relative w-full flex items-end justify-center h-32">
                        <div className="w-full bg-gradient-to-t from-purple-500 to-pink-500 rounded-t-lg transition-all duration-500 hover:opacity-80" style={{ height: `${height}px` }} />
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{day}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 🎯 Active Goals */}
            <div className="card-glass animate-fadeIn">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                  <Target className="w-5 h-5 text-blue-500" />Active Goals
                </h3>
                <Link to="/goals" className="text-sm text-purple-600 hover:underline font-medium">View all</Link>
              </div>
              <div className="space-y-3">
                {[{ title: 'Morning Exercise', progress: 0, icon: Trophy, color: 'red' }].map((goal, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full bg-${goal.color}-100 dark:bg-${goal.color}-900/30 flex items-center justify-center`}>
                        <goal.icon className={`w-5 h-5 text-${goal.color}-500`} />
                      </div>
                      <div><h4 className="font-bold text-gray-900 dark:text-white text-sm">{goal.title}</h4><p className="text-xs text-gray-500">{goal.progress}%</p></div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                ))}
              </div>
            </div>

            {/* 📝 Recent Journal */}
            <div className="card-glass animate-fadeIn">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                  <BookOpen className="w-5 h-5 text-purple-500" />Recent Journal
                </h3>
                <Link to="/entries" className="text-sm text-purple-600 hover:underline font-medium">View all</Link>
              </div>
              {recentEntries.length > 0 ? (
                <div className="space-y-3">
                  {recentEntries.slice(0, 2).map((entry) => (
                    <Link key={entry._id} to="/entries" className="block p-4 bg-gray-50 dark:bg-gray-700/30 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-all">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{entry.moodEmoji}</span>
                        <div className="flex-1"><h4 className="font-bold text-gray-900 dark:text-white text-sm">{entry.title || 'Untitled'}</h4><p className="text-xs text-gray-500 line-clamp-2 mt-1">{entry.notes}</p></div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : <p className="text-center text-gray-500 py-8 text-sm">No entries yet</p>}
            </div>

          </div>

          {/* ═══════════ RIGHT (1 col) ═══════════ */}
          <div className="space-y-6">
            
            {/* 🔥 Streak */}
            <div className="card-glass animate-scaleIn">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4" style={{ fontFamily: 'Orbitron, sans-serif' }}>Your Streak</h3>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                    <Flame className={`w-8 h-8 text-white ${(userData?.streak || 0) >= 7 ? 'streak-fire' : ''}`} />
                  </div>
                  <div>
                    <p className="text-5xl font-black text-gray-900 dark:text-white" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                      <AnimatedCounter value={userData?.streak || 0} />
                    </p>
                    <p className="text-sm text-gray-500">day streak</p>
                  </div>
                </div>
                <div className="text-right"><div className="flex items-center gap-1 text-yellow-500 mb-1"><Trophy className="w-4 h-4" /><span className="text-xs font-bold">0</span></div><p className="text-xs text-gray-500">best</p></div>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2"><Calendar className="w-4 h-4" />This Week</h4>
                <StreakHeatmap weeklyActivity={weeklyActivity} />
              </div>
            </div>

            {/* 😊 Mood Picker */}
            <div className="card-glass animate-fadeIn">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3" style={{ fontFamily: 'Orbitron, sans-serif' }}>How are you feeling?</h3>
              <div className="grid grid-cols-4 gap-2">
                {moods.map((mood, i) => (
                  <button key={i} onClick={() => handleMoodSelect(mood.label)} className={`flex flex-col items-center gap-1 p-2.5 rounded-xl transition-all border-2 ${selectedMood === mood.label ? `bg-gradient-to-br ${mood.color} text-white scale-110 border-transparent` : 'bg-gray-100 dark:bg-gray-700/50 hover:bg-gray-200 dark:hover:bg-gray-700 border-transparent'}`}>
                    <span className="text-2xl">{mood.emoji}</span>
                    <span className="text-[10px] font-bold uppercase">{mood.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 🤖 AI Coach with Animated Border */}
            <div className="card-glass animated-border animate-fadeIn relative z-10">
              <div className="relative z-20 bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 rounded-2xl p-6 text-white">
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2 bg-white/20 rounded-lg"><Brain className="w-6 h-6" /></div>
                  <div><h3 className="text-lg font-bold" style={{ fontFamily: 'Orbitron, sans-serif' }}>AI Coach</h3><p className="text-sm text-white/80">Personalized advice</p></div>
                </div>
                <div className="bg-black/20 rounded-xl p-4 backdrop-blur-sm">
                  <p className="text-sm text-white/90 italic">{aiAdvice || '"Start your journey today! Every achievement begins with a single step."'}</p>
                </div>
                <Link to="/ai-chat" className="mt-3 block text-center text-sm font-bold hover:underline">Ask AI Coach →</Link>
              </div>
            </div>

            {/* 🏆 Badges */}
            <div className="card-glass animate-fadeIn">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2" style={{ fontFamily: 'Orbitron, sans-serif' }}>
                  <Trophy className="w-5 h-5 text-yellow-500" />Badges
                </h3>
                <div className="flex items-center gap-1 text-yellow-500"><Trophy className="w-4 h-4" /><span className="text-sm font-bold">0</span></div>
              </div>
              <div className="text-center py-8">
                <Trophy className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-3 bounce-subtle" />
                <p className="text-gray-500 dark:text-gray-400 font-medium mb-2">No badges yet</p>
                <Link to="/challenges" className="text-sm text-purple-600 hover:underline font-medium">View All Badges</Link>
              </div>
            </div>

          </div>

        </div>

      </div>

      <BottomNav />
    </div>
  );
}

export default Dashboard;