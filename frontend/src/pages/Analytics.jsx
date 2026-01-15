import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { statsAPI } from '../utils/api';
import { 
  BarChart, Bar, AreaChart, Area, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { Target, TrendingUp, Calendar, Award, Activity, Flame, Zap, ArrowUpRight, Trophy, Star, Medal, Crown, Sparkles, Download, ChevronUp, ChevronDown } from 'lucide-react';

// 🏆 Animated Counter Component
const AnimatedCounter = memo(({ value, duration = 1500, suffix = '' }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const numValue = parseInt(value) || 0;
    if (numValue === 0) { setCount(0); return; }
    
    const steps = 60;
    const increment = numValue / steps;
    let current = 0;
    
    const timer = setInterval(() => {
      current += increment;
      if (current >= numValue) {
        setCount(numValue);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, [value, duration]);
  
  return <span>{count.toLocaleString()}{suffix}</span>;
});

// 📅 Calendar Heatmap Component
const CalendarHeatmap = memo(({ data }) => {
  const weeks = useMemo(() => {
    const result = [];
    const today = new Date();
    
    for (let i = 83; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayData = data?.find(d => d._id?.startsWith(dateStr));
      
      result.push({
        date: dateStr,
        day: date.getDate(),
        entries: dayData?.entries || 0,
        xp: dayData?.totalXP || 0
      });
    }
    
    // Group into weeks (7 days each)
    const grouped = [];
    for (let i = 0; i < result.length; i += 7) {
      grouped.push(result.slice(i, i + 7));
    }
    return grouped;
  }, [data]);

  const getIntensity = (entries) => {
    if (entries === 0) return 'bg-gray-100 dark:bg-gray-800';
    if (entries <= 1) return 'bg-green-200 dark:bg-green-900';
    if (entries <= 3) return 'bg-green-400 dark:bg-green-700';
    if (entries <= 5) return 'bg-green-500 dark:bg-green-600';
    return 'bg-green-600 dark:bg-green-500';
  };

  return (
    <div className="flex gap-1 overflow-x-auto pb-2">
      {weeks.map((week, wi) => (
        <div key={wi} className="flex flex-col gap-1">
          {week.map((day, di) => (
            <div
              key={di}
              className={`w-3 h-3 rounded-sm ${getIntensity(day.entries)} transition-all hover:scale-150 hover:ring-2 hover:ring-purple-500 cursor-pointer`}
              title={`${day.date}: ${day.entries} entries, ${day.xp} XP`}
            />
          ))}
        </div>
      ))}
    </div>
  );
});

// 🎖️ Achievement Badge Component
const AchievementBadge = memo(({ icon: Icon, title, unlocked, color }) => (
  <div className={`flex flex-col items-center p-3 rounded-xl transition-all ${
    unlocked 
      ? `bg-gradient-to-br ${color} text-white shadow-lg transform hover:scale-110` 
      : 'bg-gray-100 dark:bg-gray-800 text-gray-400 grayscale'
  }`}>
    <Icon size={24} className={unlocked ? 'animate-pulse' : ''} />
    <span className="text-xs font-bold mt-1 text-center">{title}</span>
  </div>
));

function Analytics() {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState(30);
  const [consistencyData, setConsistencyData] = useState(null);
  const [goalTimeline, setGoalTimeline] = useState(null);
  const [weeklyActivity, setWeeklyActivity] = useState([]);
  const [showComparison, setShowComparison] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const [consistency, timeline, weekly] = await Promise.all([
        statsAPI.getGoalConsistency(timeRange),
        statsAPI.getGoalTimeline(),
        statsAPI.getWeeklyActivity()
      ]);
      if (consistency.success) setConsistencyData(consistency.data);
      if (timeline.success) setGoalTimeline(timeline.data);
      if (weekly.success) setWeeklyActivity(processWeeklyActivity(weekly.data));
    } catch (error) {
      console.error("Analytics error:", error);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  const processWeeklyActivity = (data) => data.map(day => ({
    date: new Date(day._id).toLocaleDateString('en-US', { weekday: 'short' }),
    fullDate: day._id,
    entries: day.entries,
    xp: day.totalXP
  }));

  // 🧠 Derived Insights
  const insights = useMemo(() => {
    if (!weeklyActivity.length || !consistencyData) return null;
    const sorted = [...weeklyActivity].sort((a, b) => b.xp - a.xp);
    const totalXP = weeklyActivity.reduce((acc, curr) => acc + curr.xp, 0);
    const avgXP = Math.round(totalXP / weeklyActivity.length);
    
    return {
      bestDay: sorted[0]?.date || 'N/A',
      bestXP: sorted[0]?.xp || 0,
      totalXP,
      avgXP,
      trend: avgXP > (consistencyData?.averages?.xp || 0) ? 'up' : 'down',
      trendPercent: Math.abs(Math.round(((avgXP - (consistencyData?.averages?.xp || 1)) / (consistencyData?.averages?.xp || 1)) * 100))
    };
  }, [weeklyActivity, consistencyData]);

  // 🏆 Achievements
  const achievements = useMemo(() => {
    if (!consistencyData) return [];
    return [
      { icon: Flame, title: '7 Day Streak', unlocked: consistencyData.currentStreak >= 7, color: 'from-orange-500 to-red-500' },
      { icon: Star, title: 'Goal Master', unlocked: consistencyData.goals.completed >= 5, color: 'from-yellow-500 to-amber-500' },
      { icon: Trophy, title: '100 XP Day', unlocked: (insights?.bestXP || 0) >= 100, color: 'from-purple-500 to-indigo-500' },
      { icon: Medal, title: '80% Consistent', unlocked: consistencyData.consistencyScore >= 80, color: 'from-green-500 to-emerald-500' },
      { icon: Crown, title: '30 Day Veteran', unlocked: consistencyData.totalDays >= 30, color: 'from-pink-500 to-rose-500' },
      { icon: Sparkles, title: 'Perfect Week', unlocked: consistencyData.currentStreak >= 7 && consistencyData.consistencyScore >= 90, color: 'from-cyan-500 to-blue-500' },
    ];
  }, [consistencyData, insights]);

  const activeGoals = useMemo(() => goalTimeline?.goals?.filter(g => g.status === 'active').slice(0, 6) || [], [goalTimeline]);

  // Custom Tooltip
  const CustomTooltip = useCallback(({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-gray-900/95 backdrop-blur-md border border-white/10 rounded-xl p-4 shadow-2xl">
        <p className="text-gray-400 text-xs uppercase tracking-wider mb-2">{label}</p>
        {payload.map((entry, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-white font-bold">{entry.name}: {entry.value}</span>
          </div>
        ))}
      </div>
    );
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-6 animate-pulse">
          <div className="h-12 w-64 bg-gray-300 dark:bg-gray-700 rounded-xl" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="h-32 bg-gray-300 dark:bg-gray-700 rounded-2xl" />)}
          </div>
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="h-72 bg-gray-300 dark:bg-gray-700 rounded-2xl" />
            <div className="h-72 bg-gray-300 dark:bg-gray-700 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="animate-fadeIn">
            <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
              Analytics Command Center
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">Deep insights into your growth journey 🚀</p>
          </div>
          
          <div className="flex gap-2 items-center">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm p-1 rounded-xl border border-gray-200 dark:border-gray-700 flex">
              {[7, 14, 30, 90].map(days => (
                <button
                  key={days}
                  onClick={() => setTimeRange(days)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${
                    timeRange === days
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'text-gray-500 hover:text-gray-800 dark:hover:text-white'
                  }`}
                >
                  {days}D
                </button>
              ))}
            </div>
            <button className="p-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors group" title="Export">
              <Download className="w-5 h-5 text-gray-500 group-hover:text-purple-600" />
            </button>
          </div>
        </div>

        {/* Smart Insights Strip */}
        {insights && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-slideIn">
            <div className="relative bg-gradient-to-br from-violet-600 to-indigo-700 rounded-2xl p-5 text-white overflow-hidden group hover:scale-[1.02] transition-transform shadow-xl shadow-indigo-500/20">
              <Trophy className="absolute -right-4 -top-4 w-24 h-24 opacity-10 group-hover:opacity-20 transition-opacity" />
              <div className="relative">
                <div className="flex items-center gap-2 text-indigo-200 text-sm mb-1"><Zap size={14}/>Peak Day</div>
                <div className="text-3xl font-black">{insights.bestDay}</div>
                <div className="text-sm text-indigo-200 mt-1">{insights.bestXP} XP earned</div>
              </div>
            </div>

            <div className="relative bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl p-5 text-white overflow-hidden group hover:scale-[1.02] transition-transform shadow-xl shadow-pink-500/20">
              <Target className="absolute -right-4 -top-4 w-24 h-24 opacity-10 group-hover:opacity-20 transition-opacity" />
              <div className="relative">
                <div className="flex items-center gap-2 text-pink-200 text-sm mb-1"><Activity size={14}/>Total XP</div>
                <div className="text-3xl font-black"><AnimatedCounter value={insights.totalXP} /></div>
                <div className="text-sm text-pink-200 mt-1">In last {timeRange} days</div>
              </div>
            </div>

            <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 overflow-hidden group hover:border-purple-500 transition-colors shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-500">Weekly Trend</span>
                <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${
                  insights.trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {insights.trend === 'up' ? <ChevronUp size={12}/> : <ChevronDown size={12}/>}
                  {insights.trendPercent}%
                </span>
              </div>
              <div className="text-2xl font-black text-gray-800 dark:text-white">{insights.avgXP} XP/day</div>
              <p className="text-xs text-gray-400 mt-1">vs. historical average</p>
            </div>
          </div>
        )}

        {/* Calendar Heatmap */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-lg animate-fadeIn">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-green-500"/>
              Activity Heatmap
            </h3>
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <span>Less</span>
              <div className="flex gap-0.5">
                <div className="w-3 h-3 rounded-sm bg-gray-100 dark:bg-gray-800"/>
                <div className="w-3 h-3 rounded-sm bg-green-200"/>
                <div className="w-3 h-3 rounded-sm bg-green-400"/>
                <div className="w-3 h-3 rounded-sm bg-green-600"/>
              </div>
              <span>More</span>
            </div>
          </div>
          <CalendarHeatmap data={consistencyData?.dailyEfforts} />
        </div>

        {/* Metric Cards */}
        {consistencyData && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fadeIn">
            {[
              { label: 'Consistency', value: consistencyData.consistencyScore, suffix: '%', icon: Flame, color: 'orange' },
              { label: 'Goals Met', value: consistencyData.goals.completed, icon: Target, color: 'blue' },
              { label: 'Current Streak', value: consistencyData.currentStreak, icon: Calendar, color: 'green' },
              { label: 'Avg XP/Day', value: consistencyData.averages.xp, icon: Award, color: 'purple' },
            ].map((stat, i) => (
              <div key={i} className={`bg-white dark:bg-gray-800 rounded-2xl p-4 border-2 border-${stat.color}-200 dark:border-${stat.color}-800/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group`}>
                <div className={`mb-3 p-2 w-fit rounded-xl bg-${stat.color}-100 dark:bg-${stat.color}-900/30`}>
                  <stat.icon className={`w-5 h-5 text-${stat.color}-500`} />
                </div>
                <div className="text-3xl font-black text-gray-800 dark:text-white">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix || ''} />
                </div>
                <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Achievements */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-lg animate-fadeIn">
          <h3 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500"/>
            Achievements
          </h3>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {achievements.map((ach, i) => (
              <AchievementBadge key={i} {...ach} />
            ))}
          </div>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6 animate-fadeIn">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-purple-500"/>
                Activity Flow
              </h3>
              <ArrowUpRight className="w-5 h-5 text-purple-500" />
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={consistencyData?.dailyEfforts} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.5}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} vertical={false}/>
                  <XAxis dataKey="_id" tickFormatter={(d) => new Date(d).getDate()} axisLine={false} tickLine={false} tick={{fontSize:11}}/>
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize:11}}/>
                  <Tooltip content={<CustomTooltip />}/>
                  <Area type="monotone" dataKey="entries" stroke="#8b5cf6" strokeWidth={3} fill="url(#areaGrad)" animationDuration={1500}/>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-pink-500"/>
                Weekly XP
              </h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyActivity} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} vertical={false}/>
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize:11}}/>
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize:11}}/>
                  <Tooltip content={<CustomTooltip />}/>
                  <Bar dataKey="xp" name="XP" radius={[6,6,6,6]} animationDuration={1500}>
                    {weeklyActivity.map((_, i) => (
                      <Cell key={i} fill={i === weeklyActivity.length - 1 ? '#ec4899' : '#fbcfe8'}/>
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Active Goals */}
        {activeGoals.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-lg animate-fadeIn">
            <h3 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-500"/>
              Active Goals ({activeGoals.length})
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeGoals.map((goal) => (
                <div
                  key={goal._id}
                  onClick={() => navigate(`/goals/${goal._id}`)}
                  className="group p-4 rounded-xl bg-gray-50 dark:bg-gray-700/30 border border-gray-100 dark:border-gray-700 hover:border-purple-500 cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 capitalize">{goal.category}</span>
                    <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-purple-500 transition-colors"/>
                  </div>
                  <h4 className="font-bold text-gray-800 dark:text-white truncate group-hover:text-purple-600 transition-colors">{goal.title}</h4>
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Progress</span>
                      <span className="font-bold">{goal.progressPercentage}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-700" style={{width:`${goal.progressPercentage}%`}}/>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default Analytics;