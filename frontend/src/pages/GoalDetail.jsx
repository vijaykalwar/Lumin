import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { goalsAPI } from '../utils/api';
import { ArrowLeft, TrendingUp, Calendar, Award, CheckCircle, Circle } from 'lucide-react';
import { showToast } from '../utils/toast';
function GoalDetail() {
  const [goal, setGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [progressInput, setProgressInput] = useState('');
  
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchGoal();
  }, [id]);

  const fetchGoal = async () => {
    setLoading(true);
    const result = await goalsAPI.getOne(id);
    if (result.success) {
      setGoal(result.data);
      setProgressInput(result.data.currentValue);
    }
    setLoading(false);
  };

  const handleUpdateProgress = async () => {
    setUpdating(true);
    const result = await goalsAPI.updateProgress(id, parseFloat(progressInput));
    
    if (result.success) {
      alert(result.message);
      fetchGoal();
    }
    
    setUpdating(false);
  };

  const handleCompleteMilestone = async (milestoneId) => {
    const result = await goalsAPI.completeMilestone(id, milestoneId);
    
    if (result.success) {
      showToast.success(result.message);
      fetchGoal();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <p className="text-white">Goal not found</p>
        </div>
      </div>
    );
  }

  const categories = {
    career: { icon: '💼', color: 'blue' },
    health: { icon: '💪', color: 'green' },
    learning: { icon: '📚', color: 'yellow' },
finance: { icon: '💰', color: 'emerald' },
relationships: { icon: '❤️', color: 'pink' },
hobbies: { icon: '🎨', color: 'purple' },
other: { icon: '🎯', color: 'gray' }
};
const categoryConfig = categories[goal.category] || categories.other;
return (
<div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
<Navbar />
  <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    
    {/* Header */}
    <div className="flex items-center justify-between mb-8">
      <button
        onClick={() => navigate('/goals')}
        className="flex items-center space-x-2 text-gray-400 hover:text-white transition"
      >
        <ArrowLeft size={20} />
        <span>Back to Goals</span>
      </button>
    </div>

    {/* Goal Header Card */}
    <div className="card mb-8">
      <div className="flex items-start justify-between mb-4">
        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full bg-${categoryConfig.color}-500/20 text-${categoryConfig.color}-400`}>
          <span className="text-2xl">{categoryConfig.icon}</span>
          <span className="font-semibold capitalize">{goal.category}</span>
        </div>
        
        <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
          goal.status === 'completed' ? 'bg-green-500/20 text-green-400' :
          goal.status === 'active' ? 'bg-blue-500/20 text-blue-400' :
          'bg-yellow-500/20 text-yellow-400'
        }`}>
          {goal.status}
        </span>
      </div>

      <h1 className="text-3xl font-bold text-white mb-4">{goal.title}</h1>
      <p className="text-gray-300 text-lg mb-6">{goal.description}</p>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-400">Overall Progress</span>
          <span className="text-2xl font-bold text-white">
            {goal.progressPercentage}%
          </span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-4">
          <div
            className="bg-gradient-to-r from-primary-500 to-accent-500 h-4 rounded-full transition-all"
            style={{ width: `${goal.progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="flex items-center space-x-3 p-4 bg-slate-800/50 rounded-lg">
          <TrendingUp className="text-primary-400" size={24} />
          <div>
            <div className="text-sm text-gray-400">Current Progress</div>
            <div className="text-xl font-bold text-white">
              {goal.currentValue} / {goal.targetValue} {goal.unit}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3 p-4 bg-slate-800/50 rounded-lg">
          <Calendar className="text-yellow-400" size={24} />
          <div>
            <div className="text-sm text-gray-400">Time Remaining</div>
            <div className="text-xl font-bold text-white">
              {goal.isOverdue ? (
                <span className="text-red-400">Overdue</span>
              ) : (
                `${goal.daysRemaining} days`
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3 p-4 bg-slate-800/50 rounded-lg">
          <Award className="text-green-400" size={24} />
          <div>
            <div className="text-sm text-gray-400">Reward</div>
            <div className="text-xl font-bold text-white">
              +{goal.xpReward} XP
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Update Progress */}
    {goal.status === 'active' && (
      <div className="card mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Update Progress</h2>
        <div className="flex items-center space-x-4">
          <input
            type="number"
            className="input-field flex-1"
            value={progressInput}
            onChange={(e) => setProgressInput(e.target.value)}
            min="0"
            step="0.1"
          />
          <span className="text-gray-400">{goal.unit}</span>
          <button
            onClick={handleUpdateProgress}
            disabled={updating}
            className="btn-primary"
          >
            {updating ? 'Updating...' : 'Update'}
          </button>
        </div>
      </div>
    )}

    {/* Milestones */}
    {goal.milestones && goal.milestones.length > 0 && (
      <div className="card">
        <h2 className="text-xl font-bold text-white mb-6">Milestones</h2>
        <div className="space-y-4">
          {goal.milestones.map((milestone) => (
            <div
              key={milestone._id}
              className={`p-4 rounded-lg border-2 transition ${
                milestone.completed
                  ? 'border-green-500 bg-green-500/10'
                  : 'border-slate-700 bg-slate-800/50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  {milestone.completed ? (
                    <CheckCircle className="text-green-400 mt-1" size={24} />
                  ) : (
                    <Circle className="text-gray-400 mt-1" size={24} />
                  )}
                  
                  <div className="flex-1">
                    <h3 className={`font-bold mb-1 ${milestone.completed ? 'text-green-400' : 'text-white'}`}>
                      {milestone.title}
                    </h3>
                    {milestone.description && (
                      <p className="text-gray-400 text-sm mb-2">{milestone.description}</p>
                    )}
                    <div className="flex items-center space-x-4 text-sm">
                      {milestone.targetValue && (
                        <span className="text-gray-400">
                          Target: {milestone.targetValue} {goal.unit}
                        </span>
                      )}
                      <span className="text-primary-400">
                        +{milestone.xpReward} XP
                      </span>
                    </div>
                  </div>
                </div>

                {!milestone.completed && goal.status === 'active' && (
                  <button
                    onClick={() => handleCompleteMilestone(milestone._id)}
                    className="btn-secondary text-sm"
                  >
                    Complete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Milestone Progress */}
        <div className="mt-6 pt-6 border-t border-slate-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400">Milestone Progress</span>
            <span className="text-white font-semibold">
              {goal.milestoneProgress}%
            </span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all"
              style={{ width: `${goal.milestoneProgress}%` }}
            ></div>
          </div>
        </div>
      </div>
    )}
  </div>
</div>
);
}
export default GoalDetail;
