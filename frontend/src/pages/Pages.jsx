import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { Target, Plus, Calendar, Flag } from 'lucide-react';

function Goals() {
  const [goals, setGoals] = useState([]);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Your Goals</h1>
            <p className="text-gray-400">
              Track and achieve your long-term objectives
            </p>
          </div>
          <button
            onClick={() => navigate('/add-goal')}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Create Goal</span>
          </button>
        </div>

        {/* Empty State */}
        <div className="card text-center py-20">
          <div className="text-6xl mb-4">🎯</div>
          <h2 className="text-2xl font-bold text-white mb-2">No goals yet</h2>
          <p className="text-gray-400 mb-6">
            Set your first goal and start your journey!
          </p>
          <button
            onClick={() => navigate('/add-goal')}
            className="btn-primary"
          >
            Create Your First Goal
          </button>
        </div>

        {/* Goal Categories - Coming Soon */}
        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <div className="card text-center">
            <div className="text-4xl mb-3">💼</div>
            <h3 className="text-lg font-bold text-white mb-1">Career</h3>
            <p className="text-sm text-gray-400">0 goals</p>
          </div>

          <div className="card text-center">
            <div className="text-4xl mb-3">💪</div>
            <h3 className="text-lg font-bold text-white mb-1">Health</h3>
            <p className="text-sm text-gray-400">0 goals</p>
          </div>

          <div className="card text-center">
            <div className="text-4xl mb-3">📚</div>
            <h3 className="text-lg font-bold text-white mb-1">Learning</h3>
            <p className="text-sm text-gray-400">0 goals</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Goals;