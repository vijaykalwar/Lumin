import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { goalsAPI } from '../utils/api';
import { Target, Plus, TrendingUp, Calendar, Award, Filter } from 'lucide-react';
import { showToast } from '../utils/toast';
function Goals() {
  const [goals, setGoals] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, active, completed
  const navigate = useNavigate();
const categoryColorMap = {
  blue: 'bg-blue-500/20 text-blue-400',
  green: 'bg-green-500/20 text-green-400',
  yellow: 'bg-yellow-500/20 text-yellow-400',
  emerald: 'bg-emerald-500/20 text-emerald-400',
  pink: 'bg-pink-500/20 text-pink-400',
  purple: 'bg-purple-500/20 text-purple-400',
  gray: 'bg-gray-500/20 text-gray-400'
};

  useEffect(() => {
    fetchGoals();
    fetchStats();
  }, [filter]);

  const fetchGoals = async () => {
    setLoading(true);
    const filters = filter !== 'all' ? { status: filter } : {};
    const result = await goalsAPI.getAll(filters);
    if (result.success) {
      setGoals(result.data || []);
    }
    setLoading(false);
  };

  const fetchStats = async () => {
    const result = await goalsAPI.getStats();
    if (result.success) {
      setStats(result.data);
    }
  };

const handleDeleteGoal = async (goalId) => {
  const toastId = showToast.loading('Deleting goal...');
  
  const result = await goalsAPI.delete(goalId);
  
  if (result.success) {
    showToast.dismiss(toastId);
    showToast.success('Goal deleted successfully');
 fetchGoals();

  } else {
    showToast.dismiss(toastId);
    showToast.error('Failed to delete goal');
  }
};
  // Category config
  const categories = {
    career: { icon: '💼', color: 'blue', label: 'Career' },
    health: { icon: '💪', color: 'green', label: 'Health' },
    learning: { icon: '📚', color: 'yellow', label: 'Learning' },
    finance: { icon: '💰', color: 'emerald', label: 'Finance' },
    relationships: { icon: '❤️', color: 'pink', label: 'Relationships' },
    hobbies: { icon: '🎨', color: 'purple', label: 'Hobbies' },
    other: { icon: '🎯', color: 'gray', label: 'Other' }
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'text-blue-400 bg-blue-500/20',
      completed: 'text-green-400 bg-green-500/20',
      paused: 'text-yellow-400 bg-yellow-500/20',
      abandoned: 'text-red-400 bg-red-500/20'
    };
    return colors[status] || colors.active;
  };

  if (loading && goals.length === 0) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-white">Loading goals...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Your Goals</h1>
            <p className="text-gray-400">
              Track and achieve your long-term objectives
            </p>
          </div>
          <button
            onClick={() => navigate('/create-goal')}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Create Goal</span>
          </button>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="card">
              <div className="flex items-center space-x-3 mb-2">
                <Target className="text-primary-400" size={24} />
                <span className="text-gray-400">Total Goals</span>
              </div>
              <div className="text-3xl font-bold text-white">{stats.total}</div>
            </div>

            <div className="card">
              <div className="flex items-center space-x-3 mb-2">
                <TrendingUp className="text-blue-400" size={24} />
                <span className="text-gray-400">Active</span>
              </div>
              <div className="text-3xl font-bold text-white">{stats.active}</div>
            </div>

            <div className="card">
              <div className="flex items-center space-x-3 mb-2">
                <Award className="text-green-400" size={24} />
                <span className="text-gray-400">Completed</span>
              </div>
              <div className="text-3xl font-bold text-white">{stats.completed}</div>
            </div>

            <div className="card">
              <div className="flex items-center space-x-3 mb-2">
                <Calendar className="text-yellow-400" size={24} />
                <span className="text-gray-400">Success Rate</span>
              </div>
              <div className="text-3xl font-bold text-white">{stats.completionRate}%</div>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="card mb-8">
          <div className="flex items-center space-x-2">
            <Filter size={20} className="text-gray-400" />
            <div className="flex space-x-2">
              {['all', 'active', 'completed', 'paused'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg transition capitalize ${
                    filter === f
                      ? 'bg-primary-500 text-white'
                      : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Goals Grid */}
       {/* Goals Grid */}
{goals.length > 0 ? (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
    {goals.map((goal) => {
      const categoryConfig = categories[goal.category] || categories.other;
      
      return (
        <div
          key={goal._id}
          onClick={() => navigate(`/goals/${goal._id}`)}
          className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer"
        >


                  {/* Category Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${categoryColorMap[categoryConfig.color] || categoryColorMap.gray}`}>
                      <span>{categoryConfig.icon}</span>
                      <span className="text-sm font-semibold">{categoryConfig.label}</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(goal.status)}`}>
                      {goal.status}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-white mb-2">
                    {goal.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">
                    {goal.description}
                  </p>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-400">Progress</span>
                      <span className="text-sm font-semibold text-white">
                        {goal.progressPercentage}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-primary-500 to-accent-500 h-2 rounded-full transition-all"
                        style={{ width: `${goal.progressPercentage}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="text-gray-400">
                      <span className="font-semibold text-white">{goal.currentValue}</span>
                      {' / '}
                      <span>{goal.targetValue}</span>
                      {' '}
                      {goal.unit}
                    </div>
                    
                    {goal.isOverdue ? (
                      <span className="text-red-400 font-semibold">
                        Overdue
                      </span>
                    ) : (
                      <span className="text-gray-400">
                        {goal.daysRemaining} days left
                      </span>
                    )}
                  </div>

                  {/* Milestones */}
                  {goal.milestones && goal.milestones.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-700">
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>Milestones</span>
                        <span>
                          {goal.milestones.filter(m => m.completed).length} / {goal.milestones.length}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="card text-center py-20">
            <div className="text-6xl mb-4">🎯</div>
            <h2 className="text-2xl font-bold text-white mb-2">No goals yet</h2>
            <p className="text-gray-400 mb-6">
              {filter === 'all' 
                ? 'Set your first goal and start your journey!'
                : `No ${filter} goals found`}
            </p>
            <button
              onClick={() => navigate('/create-goal')}
              className="btn-primary"
            >
              Create Your First Goal
            </button>
          </div>
        )}

        {/* Category Overview */}
        {stats && stats.byCategory && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-white mb-6">Goals by Category</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Object.entries(categories).map(([key, config]) => {
                const catStats = stats.byCategory[key] || { total: 0, completed: 0 };
                
                return (
                  <div
                    key={key}
                    className="card text-center hover:scale-105 transition-transform cursor-pointer"
                    onClick={() => setFilter(key)}
                  >
                    <div className="text-4xl mb-2">{config.icon}</div>
                    <h3 className="text-lg font-bold text-white mb-1">{config.label}</h3>
                    <p className="text-sm text-gray-400">
                      {catStats.total} goals • {catStats.completed} done
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Goals;