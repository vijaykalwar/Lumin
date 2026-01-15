import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import DailyChallenges from '../components/DailyChallenges';
import { challengesAPI } from '../utils/api';
import { Trophy, TrendingUp, Calendar, Award } from 'lucide-react';

function Challenges() {
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    
    const [historyResult, statsResult] = await Promise.all([
      challengesAPI.getHistory(30),
      challengesAPI.getStats()
    ]);

    if (historyResult.success) {
      setHistory(historyResult.data.history);
      setStats(historyResult.data.stats);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Daily Challenges</h1>
          <p className="text-gray-400">Complete challenges to earn bonus XP</p>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="card">
              <div className="flex items-center space-x-3 mb-2">
                <Trophy className="text-yellow-400" size={24} />
                <span className="text-gray-400">Total XP Earned</span>
              </div>
              <div className="text-3xl font-bold text-white">{stats.totalXPEarned}</div>
            </div>

            <div className="card">
              <div className="flex items-center space-x-3 mb-2">
                <Award className="text-green-400" size={24} />
                <span className="text-gray-400">Completed</span>
              </div>
              <div className="text-3xl font-bold text-white">{stats.completedChallenges}</div>
            </div>

            <div className="card">
              <div className="flex items-center space-x-3 mb-2">
                <TrendingUp className="text-blue-400" size={24} />
                <span className="text-gray-400">Success Rate</span>
              </div>
              <div className="text-3xl font-bold text-white">{stats.completionRate}%</div>
            </div>

            <div className="card">
              <div className="flex items-center space-x-3 mb-2">
                <Calendar className="text-purple-400" size={24} />
                <span className="text-gray-400">Perfect Days</span>
              </div>
              <div className="text-3xl font-bold text-white">{stats.perfectDays}</div>
            </div>
          </div>
        )}

        {/* Today's Challenges */}
        <DailyChallenges />

        {/* Challenge History */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-white mb-6">Recent History</h2>
          
          {history.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6">
              {history.slice(0, 10).map((day) => (
                <div key={day._id} className="card">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-white font-semibold">
                      {new Date(day.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      day.completedCount === 3
                        ? 'bg-green-500/20 text-green-400'
                        : day.completedCount > 0
                        ? 'bg-yellow-500/20 text-yellow-400'
                        : 'bg-gray-500/20 text-gray-400'
                    }`}>
                      {day.completedCount} / {day.challenges.length}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {day.challenges.map((challenge) => (
                      <div
                        key={challenge._id}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className={challenge.completed ? 'text-green-400' : 'text-gray-400'}>
                          {challenge.completed ? '✓' : '○'} {challenge.title}
                        </span>
                        {challenge.completed && (
                          <span className="text-primary-400">+{challenge.xpReward} XP</span>
                        )}
                      </div>
                    ))}
                  </div>

                  {day.totalXPEarned > 0 && (
                    <div className="mt-4 pt-4 border-t border-slate-700 text-center">
                      <span className="text-yellow-400 font-bold">
                        +{day.totalXPEarned} XP Total
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="card text-center py-12">
              <Trophy className="mx-auto mb-4 text-gray-600" size={48} />
              <p className="text-gray-400">No challenge history yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Challenges;