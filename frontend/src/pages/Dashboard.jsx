import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import { statsAPI } from '../utils/api';
import {BookOpen,Target,TrendingUp,Award,Flame,PlusCircle,Clock} from 'lucide-react';
import DailyChallenges from '../components/DailyChallenges';
import { showToast } from '../utils/toast';
import{ StatSkeleton, CardSkeleton } from '../components/Skeleton';
import React, { Suspense } from 'react';
const DailyChallenges = React.lazy(() => import('../components/DailyChallenges'));


function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

 useEffect(() => {
  const cached = localStorage.getItem('dashboardCache');
  if (cached) setDashboardData(JSON.parse(cached));
  fetchDashboardData();
}, []);
  const fetchDashboardData = async () => {
  setLoading(true);
  const result = await statsAPI.getDashboard();
  if (result.success) {
    setDashboardData(result.data);
    localStorage.setItem('dashboardCache', JSON.stringify(result.data));
  }
  setLoading(false);
};
  if (loading) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900 p-4 sm:p-6 lg:p-8">
      <Navbar />
      <div className="max-w-7xl mx-auto">

        <div className="mb-8">
          <div className="h-10 w-64 bg-gray-300 dark:bg-gray-700 rounded mb-2 animate-pulse"></div>
          <div className="h-6 w-48 bg-gray-200 dark:bg-gray-600 rounded animate-pulse"></div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatSkeleton />
          <StatSkeleton />
          <StatSkeleton />
          <StatSkeleton />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <CardSkeleton />
          </div>
          <div>
            <CardSkeleton />
          </div>
        </div>

      </div>
    </div>
  );
}


  const userData = dashboardData?.user || user;
  const userStats = dashboardData?.user || {};
  const statsOverview = dashboardData?.stats || {};
  const recentEntries = dashboardData?.recentEntries || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900">
      <Navbar />
      
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Header */}
          <div className="mb-8 flex justify-between items-end">
            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 dark:text-white mb-2 animate-fadeIn">
                Welcome back, {user?.name}! 👋
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                Let's make today count. Here's your overview.
              </p>
            </div>
            
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Stats Grid - Responsive */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-8">
            
            {/* XP Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 hover:shadow-xl transition-shadow duration-300 border border-purple-100 dark:border-purple-900/20">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                  <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">XP</span>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-2">
                {userData?.xp || 0}
              </p>
              <div className="relative pt-1">
                <div className="overflow-hidden h-2 text-xs flex rounded-full bg-gray-100 dark:bg-gray-700">
                  <div
                    style={{ width: `${(userData?.xp % 100)}%` }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-1000 ease-out"
                  ></div>
                </div>
                <p className="text-xs text-right mt-1 text-gray-500">Level {userData?.level}</p>
              </div>
            </div>

            {/* Streak Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 hover:shadow-xl transition-shadow duration-300 border border-orange-100 dark:border-orange-900/20">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                  <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Streak</span>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-1">
                {userData?.streak || 0}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                days on fire <span className="text-orange-500">🔥</span>
              </p>
            </div>

            {/* Entries Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 hover:shadow-xl transition-shadow duration-300 border border-blue-100 dark:border-blue-900/20">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                  <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Entries</span>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-1">
                {statsOverview?.totalEntries || 0}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">total reflection moments</p>
            </div>

            {/* Goals Card */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-5 hover:shadow-xl transition-shadow duration-300 border border-green-100 dark:border-green-900/20">
              <div className="flex items-center justify-between mb-3">
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                  <Target className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Goals</span>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-gray-800 dark:text-white mb-1">
                {statsOverview?.activeGoals || 0}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">targets in progress</p>
            </div>

          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Quick Actions */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-purple-500 rounded-full"></div>
                  Quick Actions
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <Link
                    to="/add-entry"
                    className="group flex flex-col items-center justify-center gap-3 p-4 bg-purple-50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-900/30 rounded-2xl hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-all duration-300"
                  >
                    <div className="p-3 bg-white dark:bg-purple-900/50 rounded-full shadow-sm group-hover:scale-110 transition-transform">
                      <PlusCircle className="w-6 h-6 text-purple-600" />
                    </div>
                    <span className="font-semibold text-gray-700 dark:text-gray-200">New Entry</span>
                  </Link>

                  <Link
                    to="/create-goal"
                    className="group flex flex-col items-center justify-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-2xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-all duration-300"
                  >
                    <div className="p-3 bg-white dark:bg-blue-900/50 rounded-full shadow-sm group-hover:scale-110 transition-transform">
                      <Target className="w-6 h-6 text-blue-600" />
                    </div>
                    <span className="font-semibold text-gray-700 dark:text-gray-200">New Goal</span>
                  </Link>

                  <Link
                    to="/pomodoro"
                    className="group flex flex-col items-center justify-center gap-3 p-4 bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30 rounded-2xl hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-all duration-300"
                  >
                    <div className="p-3 bg-white dark:bg-orange-900/50 rounded-full shadow-sm group-hover:scale-110 transition-transform">
                      <Clock className="w-6 h-6 text-orange-600" />
                    </div>
                    <span className="font-semibold text-gray-700 dark:text-gray-200">Pomodoro</span>
                  </Link>
                </div>
              </div>

              {/* Recent Entries */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
                    Recent Entries
                  </h2>
                  <Link
                    to="/entries"
                    className="text-sm font-medium text-purple-600 hover:text-purple-700 hover:underline"
                  >
                    View All
                  </Link>
                </div>

                <div className="space-y-3">
                  {recentEntries.map((entry) => (
                    <Link
                      to={`/entries`} // Ideally this would go to entry detail
                      key={entry._id}
                      className="block p-4 bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700 rounded-xl hover:bg-white dark:hover:bg-gray-700 hover:shadow-md transition-all duration-200"
                    >
                      <div className="flex items-start gap-4">
                        <span className="text-3xl bg-white dark:bg-gray-800 p-2 rounded-lg shadow-sm">{entry.moodEmoji}</span>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-800 dark:text-white truncate mb-1">
                            {entry.title || 'Untitled Entry'}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                            {entry.notes}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(entry.createdAt).toLocaleDateString()}
                            </span>
                            {entry.tags?.slice(0, 3).map((tag, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-md font-medium"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}

                  {recentEntries.length === 0 && (
                    <div className="text-center py-10 bg-gray-50 dark:bg-gray-700/30 rounded-xl border-dashed border-2 border-gray-200 dark:border-gray-700">
                      <BookOpen className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                      <p className="text-gray-500 dark:text-gray-400 font-medium">No entries yet</p>
                      <p className="text-sm text-gray-400 mb-4">Start recording your journey today</p>
                      <Link
                        to="/add-entry"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all"
                      >
                        <PlusCircle className="w-4 h-4" />
                        Write First Entry
                      </Link>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Right Column - Daily Challenges */}
           <div className="lg:col-span-1">
  <Suspense fallback={<div>Loading challenges...</div>}>
    <DailyChallenges />
  </Suspense>
</div>

          </div>

        </div>
      </div>
    </div>
  );
}
export default Dashboard;