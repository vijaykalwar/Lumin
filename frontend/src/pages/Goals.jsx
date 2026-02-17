import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import BottomNav from '../components/BottomNav';
import { goalsAPI, aiAPI } from '../utils/api';
import {
  Target,
  Plus,
  Sparkles,
  Trophy,
  Flame,
  Calendar,
  CheckCircle2,
  Circle,
  Pause,
  Play,
  Trash2,
  Edit3,
  Tag,
  Heart,
  Briefcase,
  BookOpen,
  User,
  Wallet,
  Dumbbell,
  ChevronRight,
  Loader2,
  Bell,
  BarChart3,
  AlertTriangle,
  Lightbulb,
  RefreshCw,
  X
} from 'lucide-react';
import { showToast } from '../utils/toast';

// ════════════════════════════════════════════════════════════
// CATEGORY CONFIG (matches backend enum)
// ════════════════════════════════════════════════════════════
const CATEGORIES = [
  { id: 'all', label: 'All', icon: Tag, color: 'bg-gray-500/20 text-gray-400' },
  { id: 'other', label: 'General', icon: Tag, color: 'bg-gray-500/20 text-gray-400' },
  { id: 'health', label: 'Health', icon: Heart, color: 'bg-pink-500/20 text-pink-400' },
  { id: 'career', label: 'Work', icon: Briefcase, color: 'bg-blue-500/20 text-blue-400' },
  { id: 'learning', label: 'Learning', icon: BookOpen, color: 'bg-purple-500/20 text-purple-400' },
  { id: 'relationships', label: 'Personal', icon: User, color: 'bg-green-500/20 text-green-400' },
  { id: 'finance', label: 'Finance', icon: Wallet, color: 'bg-yellow-500/20 text-yellow-400' },
  { id: 'hobbies', label: 'Fitness', icon: Dumbbell, color: 'bg-orange-500/20 text-orange-400' }
];

const PRIORITY_STYLES = {
  high: 'bg-red-500/20 text-red-400 border-red-500/50',
  medium: 'bg-amber-500/20 text-amber-400 border-amber-500/50',
  low: 'bg-purple-500/20 text-purple-400 border-purple-500/50'
};

// ════════════════════════════════════════════════════════════
// GOAL TEMPLATES (client-side presets)
// ════════════════════════════════════════════════════════════
const GOAL_TEMPLATES = [
  { icon: '🏃', name: 'Run 5K', description: 'Complete a 5K run', category: 'health', priority: 'medium' },
  { icon: '📚', name: 'Read 12 Books', description: 'Read one book per month', category: 'learning', priority: 'low' },
  { icon: '💰', name: 'Save $500', description: 'Build emergency fund', category: 'finance', priority: 'high' },
  { icon: '💼', name: 'Learn New Skill', description: 'Complete an online course', category: 'career', priority: 'medium' },
  { icon: '🧘', name: 'Meditate Daily', description: '10 min meditation every day', category: 'health', priority: 'low' },
  { icon: '🎯', name: 'Weekly Review', description: 'Review goals every Sunday', category: 'other', priority: 'medium' }
];

export default function Goals() {
  const navigate = useNavigate();
  const [goals, setGoals] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [editingGoal, setEditingGoal] = useState(null);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [insights, setInsights] = useState([]);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    fetchGoals();
    fetchStats();
  }, [statusFilter, categoryFilter]);

  useEffect(() => {
    if (goals.length > 0) {
      fetchInsights();
      computeAnalytics();
    } else {
      setAnalytics(null);
      setInsights([]);
    }
  }, [goals]);

  const fetchGoals = async () => {
    setLoading(true);
    const filters = { limit: 50 };
    if (statusFilter !== 'all') filters.status = statusFilter;
    if (categoryFilter !== 'all') filters.category = categoryFilter;
    const result = await goalsAPI.getAll(filters);
    if (result.success) {
      const list = result.data?.goals ?? (Array.isArray(result.data) ? result.data : []);
      setGoals(list);
    }
    setLoading(false);
  };

  const fetchStats = async () => {
    const result = await goalsAPI.getStats();
    if (result.success) setStats(result.data);
  };

  const fetchInsights = async () => {
    setInsightsLoading(true);
    try {
      const payload = goals.slice(0, 5).map((g) => {
        const progress = g.progressPercentage ?? (g.targetValue > 0 ? Math.min(100, Math.round((Number(g.currentValue) || 0) / Number(g.targetValue) * 100)) : 0);
        return { title: g.title, progress };
      });
      const res = await aiAPI.planGoal({ goals: payload });
      const raw = res?.data?.insights ?? res?.insights;
      if (Array.isArray(raw) && raw.length > 0) {
        setInsights(raw.slice(0, 3).map((i) => ({
          type: i.type || 'tip',
          title: i.title || i.heading || 'Insight',
          message: i.message || i.description || ''
        })));
      } else {
        setInsights(getLocalInsights());
      }
    } catch {
      setInsights(getLocalInsights());
    }
    setInsightsLoading(false);
  };

  const getLocalInsights = () => {
    const list = [];
    try {
      const active = goals.filter((g) => g.status === 'active').length;
      const completed = goals.filter((g) => g.status === 'completed').length;
      if (active === 0 && completed === 0) {
        list.push({ type: 'tip', title: 'Get started', message: 'Create your first goal to build momentum!' });
      } else if (active > 5) {
        list.push({ type: 'warning', title: 'Focus', message: 'You have many active goals. Consider completing a few to stay focused.' });
      } else if (completed > 0) {
        list.push({ type: 'success', title: 'On track', message: `${completed} goal(s) completed. Keep it up!` });
      }
      const nearComplete = goals.some((g) => {
        const p = g.progressPercentage ?? (g.targetValue > 0 ? Math.round((Number(g.currentValue) || 0) / Number(g.targetValue) * 100) : 0);
        return g.status === 'active' && p >= 80;
      });
      if (nearComplete) list.push({ type: 'tip', title: 'Almost there', message: 'Some goals are near completion. Push to finish!' });
    } catch (_) {
      list.push({ type: 'tip', title: 'Tips', message: 'Add goals to get personalized insights.' });
    }
    return list.slice(0, 3);
  };

  const computeAnalytics = () => {
    const active = goals.filter(g => g.status === 'active');
    const completed = goals.filter(g => g.status === 'completed');
    const total = goals.length;
    const completionRate = total ? Math.round((completed.length / total) * 100) : 0;
    const allWithProgress = goals.filter(g => g.targetValue > 0);
    const avgProgress = allWithProgress.length
      ? Math.round(allWithProgress.reduce((s, g) => s + (g.progressPercentage || 0), 0) / allWithProgress.length)
      : 0;
    const high = goals.filter(g => g.priority === 'high').length;
    const medium = goals.filter(g => g.priority === 'medium').length;
    const low = goals.filter(g => g.priority === 'low').length;
    const productivityScore = total === 0 ? 0 : Math.min(100, completionRate + Math.round(avgProgress / 2));
    setAnalytics({
      completionRate,
      avgProgress,
      productivityScore,
      priority: { high, medium, low },
      recommendations: completed.length === 0 && active.length > 0
        ? ['Focus on one goal to get your first completion.', 'Set a target date to stay accountable.']
        : active.length > 2
          ? ['Prioritize your top 2 goals this week.']
          : []
    });
  };

  const activeGoals = useMemo(() => goals.filter(g => g.status === 'active'), [goals]);
  const pausedGoals = useMemo(() => goals.filter(g => g.status === 'paused'), [goals]);
  const completedGoals = useMemo(() => goals.filter(g => g.status === 'completed'), [goals]);
  const totalXP = useMemo(() => completedGoals.reduce((s, g) => s + (g.xpReward || 0), 0), [completedGoals]);

  const handleUpdateProgress = async (goalId, currentValue) => {
    setUpdatingId(goalId);
    const res = await goalsAPI.updateProgress(goalId, currentValue);
    setUpdatingId(null);
    if (res.success) {
      showToast.success('Progress updated!');
      fetchGoals();
      fetchStats();
      if (res.data?.status === 'completed') showToast.success('🎉 Goal completed!');
    } else showToast.error(res.message || 'Update failed');
  };

  const handlePauseResume = async (goal) => {
    const next = goal.status === 'paused' ? 'active' : 'paused';
    const res = await goalsAPI.update(goal._id, { status: next });
    if (res.success) {
      showToast.success(next === 'paused' ? 'Goal paused' : 'Goal resumed');
      fetchGoals();
      fetchStats();
    } else showToast.error(res.message || 'Failed');
  };

  const handleDelete = async (goalId) => {
    if (!window.confirm('Delete this goal?')) return;
    const toastId = showToast.loading('Deleting...');
    const res = await goalsAPI.delete(goalId);
    showToast.dismiss(toastId);
    if (res.success) {
      showToast.success('Goal deleted');
      fetchGoals();
      fetchStats();
      setEditingGoal(null);
    } else showToast.error(res.message || 'Delete failed');
  };

  const handleSaveEdit = async (payload) => {
    if (!editingGoal) return;
    const toastId = showToast.loading('Saving...');
    const res = await goalsAPI.update(editingGoal._id, payload);
    showToast.dismiss(toastId);
    if (res.success) {
      showToast.success('Goal updated');
      fetchGoals();
      setEditingGoal(null);
    } else showToast.error(res.message || 'Update failed');
  };

  const useTemplate = (template) => {
    setTemplatesOpen(false);
    navigate('/create-goal', { state: { template } });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <div className="max-w-7xl mx-auto px-3 sm:px-4 pt-20 sm:pt-24 pb-24">
        {/* ─── HEADER ─── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Target className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500" />
              My Goals
            </h1>
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 mt-1">
              Track your daily goals and achieve greatness
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setTemplatesOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-purple-500 dark:hover:border-purple-500 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Templates
            </button>
            <button
              onClick={() => navigate('/create-goal')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 text-white font-semibold rounded-xl shadow-lg hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" />
              Create Goal
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ─── CATEGORY FILTER BAR ─── */}
        <div className="overflow-x-auto scrollbar-hide -mx-3 px-3 sm:mx-0 sm:px-0 mb-6">
          <div className="flex gap-2 min-w-max sm:flex-wrap">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const selected = categoryFilter === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setCategoryFilter(cat.id)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                    selected
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                      : `border border-gray-200 dark:border-gray-700 ${cat.color} hover:opacity-90`
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ─── STATS OVERVIEW (3 cards) ─── */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
          <div className="card-glass p-3 sm:p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 rounded-lg bg-purple-500/20">
                <Target className="w-4 h-4 text-purple-500" />
              </div>
              <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Active</span>
            </div>
            <div className="text-lg sm:text-2xl font-display font-bold text-gray-900 dark:text-white">
              {stats?.active ?? activeGoals.length}
            </div>
          </div>
          <div className="card-glass p-3 sm:p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 rounded-lg bg-green-500/20">
                <Trophy className="w-4 h-4 text-green-500" />
              </div>
              <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Done</span>
            </div>
            <div className="text-lg sm:text-2xl font-display font-bold text-gray-900 dark:text-white">
              {stats?.completed ?? completedGoals.length}
            </div>
          </div>
          <div className="card-glass p-3 sm:p-4 rounded-xl">
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 rounded-lg bg-amber-500/20">
                <Flame className="w-4 h-4 text-amber-500" />
              </div>
              <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">XP</span>
            </div>
            <div className="text-lg sm:text-2xl font-display font-bold text-gray-900 dark:text-white">
              {totalXP.toLocaleString()}
            </div>
          </div>
        </div>

        {/* ─── STATUS TABS ─── */}
        <div className="flex gap-2 mb-6">
          {['all', 'active', 'paused', 'completed'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-2 rounded-xl text-sm font-medium capitalize ${
                statusFilter === s
                  ? 'bg-purple-600 text-white'
                  : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-purple-500'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* ─── MAIN CONTENT ─── */}
          <div className="lg:col-span-3 space-y-8">
            {loading && goals.length === 0 ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-10 h-10 text-purple-500 animate-spin" />
              </div>
            ) : (
              <>
                {/* Active Goals */}
                {(statusFilter === 'all' || statusFilter === 'active') && activeGoals.length > 0 && (
                  <section>
                    <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white mb-4">
                      <Circle className="w-5 h-5 text-blue-500" />
                      Active Goals
                    </h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {activeGoals.map((goal) => (
                        <GoalCard
                          key={goal._id}
                          goal={goal}
                          onUpdateProgress={handleUpdateProgress}
                          onPauseResume={handlePauseResume}
                          onEdit={() => setEditingGoal(goal)}
                          onDelete={() => handleDelete(goal._id)}
                          isUpdating={updatingId === goal._id}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* Paused Goals */}
                {(statusFilter === 'all' || statusFilter === 'paused') && pausedGoals.length > 0 && (
                  <section>
                    <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white mb-4">
                      <Pause className="w-5 h-5 text-amber-500" />
                      Paused
                    </h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {pausedGoals.map((goal) => (
                        <GoalCard
                          key={goal._id}
                          goal={goal}
                          onUpdateProgress={handleUpdateProgress}
                          onPauseResume={handlePauseResume}
                          onEdit={() => setEditingGoal(goal)}
                          onDelete={() => handleDelete(goal._id)}
                          isUpdating={updatingId === goal._id}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* Completed Goals */}
                {(statusFilter === 'all' || statusFilter === 'completed') && completedGoals.length > 0 && (
                  <section>
                    <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900 dark:text-white mb-4">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      Completed
                    </h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {completedGoals.map((goal) => (
                        <GoalCard
                          key={goal._id}
                          goal={goal}
                          onEdit={() => setEditingGoal(goal)}
                          onDelete={() => handleDelete(goal._id)}
                          readOnly
                        />
                      ))}
                    </div>
                  </section>
                )}

                {/* Empty state */}
                {goals.length === 0 && (
                  <div className="card-glass rounded-2xl p-12 text-center">
                    <Target className="w-16 h-16 text-gray-400 mx-auto mb-4 opacity-50" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No goals yet</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                      {categoryFilter !== 'all' || statusFilter !== 'all'
                        ? 'No goals match this filter.'
                        : 'Create your first goal or try a template.'}
                    </p>
                    <button
                      onClick={() => navigate('/create-goal')}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl"
                    >
                      <Plus className="w-4 h-4" />
                      Create Goal
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* ─── RIGHT SIDEBAR (desktop) ─── */}
          <div className="hidden lg:block space-y-6">
            <NotificationSettings />
            <GoalInsightsPanel insights={insights} loading={insightsLoading} onRefresh={fetchInsights} />
            <GoalAnalyticsPanel analytics={analytics} />
          </div>
        </div>

        {/* Mobile: Insights & Analytics below content */}
        <div className="lg:hidden mt-8 space-y-6">
          <GoalInsightsPanel insights={insights} loading={insightsLoading} onRefresh={fetchInsights} />
          <GoalAnalyticsPanel analytics={analytics} />
        </div>
      </div>

      {/* Templates Dialog */}
      {templatesOpen && (
        <TemplatesDialog onClose={() => setTemplatesOpen(false)} onUse={useTemplate} />
      )}

      {/* Edit Goal Dialog */}
      {editingGoal && (
        <EditGoalDialog
          goal={editingGoal}
          onClose={() => setEditingGoal(null)}
          onSave={handleSaveEdit}
        />
      )}

      <BottomNav />
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// GOAL CARD
// ════════════════════════════════════════════════════════════
function GoalCard({ goal, onUpdateProgress, onPauseResume, onEdit, onDelete, isUpdating, readOnly }) {
  const navigate = useNavigate();
  const categoryConfig = CATEGORIES.find(c => c.id === goal.category) || CATEGORIES[1];
  const Icon = categoryConfig.icon;
  const progress = goal.progressPercentage ?? (goal.targetValue > 0 ? Math.min(100, Math.round((goal.currentValue / goal.targetValue) * 100)) : 0);
  const isComplete = progress >= 100 || goal.status === 'completed';
  const quickPercents = [25, 50, 75, 100];

  return (
    <div
      className="group card-glass p-4 sm:p-5 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-purple-500/50 transition-all"
      onClick={() => !readOnly && navigate(`/goals/${goal._id}`)}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex flex-wrap gap-2">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-medium border ${PRIORITY_STYLES[goal.priority] || PRIORITY_STYLES.medium}`}>
            {goal.priority}
          </span>
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium ${categoryConfig.color}`}>
            <Icon className="w-3 h-3" />
            {categoryConfig.label}
          </span>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 sm:opacity-100 transition-opacity">
          {!readOnly && goal.status !== 'completed' && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); onPauseResume(goal); }}
                className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
                title={goal.status === 'paused' ? 'Resume' : 'Pause'}
              >
                {goal.status === 'paused' ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              </button>
              {isComplete && (
                <span className="text-green-500" title="Completed">
                  <CheckCircle2 className="w-4 h-4" />
                </span>
              )}
            </>
          )}
          <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700" title="Edit">
            <Edit3 className="w-4 h-4" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-2 rounded-lg hover:bg-red-500/20 text-red-500" title="Delete">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      {goal.targetDate && (
        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mb-2">
          <Calendar className="w-3.5 h-3.5" />
          {new Date(goal.targetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
      )}
      <h3 className="font-semibold text-gray-900 dark:text-white truncate mb-1">{goal.title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">{goal.description}</p>
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-gray-500 dark:text-gray-400">Progress</span>
          <span className="font-semibold text-purple-500">{progress}%</span>
        </div>
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        {!readOnly && goal.status === 'active' && (
          <div className="flex flex-wrap gap-1 pt-2">
            {quickPercents.map((p) => (
              <button
                key={p}
                disabled={isUpdating || progress >= p}
                onClick={(e) => {
                  e.stopPropagation();
                  const value = (p / 100) * goal.targetValue;
                  onUpdateProgress(goal._id, value);
                }}
                className="px-2 py-1 rounded text-xs font-medium bg-gray-200 dark:bg-gray-700 hover:bg-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {p}%
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// TEMPLATES DIALOG
// ════════════════════════════════════════════════════════════
function TemplatesDialog({ onClose, onUse }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            Goal Templates
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 grid sm:grid-cols-2 gap-3">
          {GOAL_TEMPLATES.map((t) => (
            <div key={t.name} className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 space-y-2">
              <div className="text-2xl">{t.icon}</div>
              <h3 className="font-semibold text-sm text-gray-900 dark:text-white">{t.name}</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{t.description}</p>
              <button
                onClick={() => onUse(t)}
                className="w-full py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium"
              >
                Use Template
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// EDIT GOAL DIALOG
// ════════════════════════════════════════════════════════════
function EditGoalDialog({ goal, onClose, onSave }) {
  const [title, setTitle] = useState(goal?.title ?? '');
  const [description, setDescription] = useState(goal?.description ?? '');
  const [category, setCategory] = useState(goal?.category ?? 'other');
  const [priority, setPriority] = useState(goal?.priority ?? 'medium');
  const [targetDate, setTargetDate] = useState(goal?.targetDate ? new Date(goal.targetDate).toISOString().slice(0, 10) : '');

  useEffect(() => {
    if (goal) {
      setTitle(goal.title);
      setDescription(goal.description);
      setCategory(goal.category || 'other');
      setPriority(goal.priority || 'medium');
      setTargetDate(goal.targetDate ? new Date(goal.targetDate).toISOString().slice(0, 10) : '');
    }
  }, [goal]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ title, description, category, priority, targetDate: targetDate || undefined });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-purple-500" />
            Edit Goal
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} required className="input-field w-full" placeholder="What do you want to achieve?" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="input-field w-full" placeholder="Add more details..." />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="input-field w-full">
                {CATEGORIES.filter(c => c.id !== 'all').map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
              <select value={priority} onChange={e => setPriority(e.target.value)} className="input-field w-full">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target Date</label>
            <input type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} className="input-field w-full" />
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300">
              Cancel
            </button>
            <button type="submit" className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold">
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// NOTIFICATION SETTINGS
// ════════════════════════════════════════════════════════════
function NotificationSettings() {
  const [permission, setPermission] = useState(typeof Notification !== 'undefined' ? Notification.permission : 'default');
  const requestPermission = () => {
    if (typeof Notification === 'undefined') return;
    Notification.requestPermission().then((p) => {
      setPermission(p);
      if (p === 'granted') showToast.success('Notifications enabled');
    });
  };
  const sendTest = () => {
    if (permission !== 'granted') return;
    try {
      new Notification('LUMIN', { body: `You're on track! Keep going with your goals.` });
      showToast.success('Test notification sent');
    } catch (e) {
      showToast.error('Could not send test');
    }
  };

  return (
    <div className="card-glass p-4 rounded-xl">
      <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
        <Bell className="w-4 h-4 text-purple-500" />
        Notifications
      </h3>
      {typeof Notification === 'undefined' ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">Not supported in this browser.</p>
      ) : permission === 'default' ? (
        <button onClick={requestPermission} className="w-full py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-medium">
          Enable Notifications
        </button>
      ) : permission === 'granted' ? (
        <div className="space-y-2">
          <span className="text-xs text-green-500 font-medium">Enabled</span>
          <button onClick={sendTest} className="w-full py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-sm">
            Send Test
          </button>
        </div>
      ) : (
        <p className="text-xs text-red-500">Blocked. Enable in browser settings.</p>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// AI INSIGHTS PANEL
// ════════════════════════════════════════════════════════════
function GoalInsightsPanel({ insights, loading, onRefresh }) {
  const iconMap = { success: CheckCircle2, warning: AlertTriangle, tip: Lightbulb };
  const colorMap = { success: 'text-green-500', warning: 'text-amber-500', tip: 'text-purple-500' };

  return (
    <div className="card-glass p-4 rounded-xl">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          AI Insights
        </h3>
        <button onClick={onRefresh} disabled={loading} className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>
      {loading ? (
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          Analyzing your goals...
        </div>
      ) : insights.length === 0 ? (
        <div className="text-center py-4">
          <Sparkles className="w-8 h-8 text-gray-400 mx-auto mb-2 opacity-50" />
          <p className="text-sm text-gray-500 dark:text-gray-400">Create some goals to get AI insights!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {insights.map((insight, i) => {
            const Icon = iconMap[insight.type] || Lightbulb;
            const color = colorMap[insight.type] || 'text-purple-500';
            return (
              <div key={i} className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <div className={`flex items-center gap-2 font-medium text-sm ${color}`}>
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {insight.title}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{insight.message}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// GOAL ANALYTICS PANEL
// ════════════════════════════════════════════════════════════
function GoalAnalyticsPanel({ analytics }) {
  if (!analytics) {
    return (
      <div className="card-glass p-4 rounded-xl">
        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-3">
          <BarChart3 className="w-4 h-4 text-cyan-500" />
          Analytics
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">Complete or create goals to see analytics.</p>
      </div>
    );
  }

  const { completionRate, avgProgress, productivityScore, priority, recommendations } = analytics;
  const totalP = (priority.high + priority.medium + priority.low) || 1;

  return (
    <div className="card-glass p-4 rounded-xl">
      <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
        <div className="p-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500">
          <BarChart3 className="w-4 h-4 text-white" />
        </div>
        Analytics
      </h3>
      <p className="text-center text-xs text-gray-500 dark:text-gray-400 mb-2">Productivity Score</p>
      <div className="flex justify-center mb-4">
        <div className="relative w-24 h-24">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="8" className="text-gray-200 dark:text-gray-700" />
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="url(#gradAnalytics)"
              strokeWidth="8"
              strokeDasharray={`${(productivityScore / 100) * 251} 251`}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
            <defs>
              <linearGradient id="gradAnalytics" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#3b82f6" />
              </linearGradient>
            </defs>
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-gray-900 dark:text-white">
            {productivityScore}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 mb-4 text-center">
        <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
          <div className="text-lg font-bold text-purple-500">{completionRate}%</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Completion</div>
        </div>
        <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
          <div className="text-lg font-bold text-cyan-500">{avgProgress}%</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Avg Progress</div>
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-xs">
          <span className="text-red-500">High</span>
          <span>{priority.high}</span>
        </div>
        <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-red-500 rounded-full" style={{ width: `${(priority.high / totalP) * 100}%` }} />
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-amber-500">Medium</span>
          <span>{priority.medium}</span>
        </div>
        <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(priority.medium / totalP) * 100}%` }} />
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-purple-500">Low</span>
          <span>{priority.low}</span>
        </div>
        <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-purple-500 rounded-full" style={{ width: `${(priority.low / totalP) * 100}%` }} />
        </div>
      </div>
      {recommendations && recommendations.length > 0 && (
        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white mb-2">
            <BarChart3 className="w-4 h-4" />
            Recommendations
          </div>
          <ul className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
            {recommendations.map((rec, i) => (
              <li key={i} className="flex items-start gap-2">
                <Target className="w-3 h-3 mt-0.5 flex-shrink-0 text-purple-500" />
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
