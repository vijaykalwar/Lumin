import { useState, useEffect } from 'react';
import { challengesAPI } from '../utils/api';
import { Trophy, Check, Clock } from 'lucide-react';

function DailyChallenges({ compact = false }) {
  const [challenges, setChallenges] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChallenges();
  }, []);

  const fetchChallenges = async () => {
    setLoading(true);
    const result = await challengesAPI.getToday();
    if (result.success) {
      setChallenges(result.data);
    }
    setLoading(false);
  };

  const handleComplete = async (challengeId) => {
    const result = await challengesAPI.complete(challengeId);
    if (result.success) {
      alert(result.message);
      fetchChallenges();
    }
  };

  if (loading) {
    return (
      <div className="card">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-700 rounded w-1/4"></div>
          <div className="h-12 bg-gray-700 rounded"></div>
          <div className="h-12 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (!challenges || !challenges.challenges || challenges.challenges.length === 0) {
    return null;
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white flex items-center">
          <Trophy className="mr-2 text-yellow-400" size={24} />
          Daily Challenges
        </h3>
        <span className="text-sm text-gray-400">
          {challenges.completedCount} / {challenges.challenges.length} completed
        </span>
      </div>

      <div className="space-y-3">
        {challenges.challenges.map((challenge) => (
          <div
            key={challenge._id}
            className={`p-4 rounded-lg border-2 transition ${
              challenge.completed
                ? 'border-green-500 bg-green-500/10'
                : 'border-slate-700 bg-slate-800/50'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                {challenge.completed ? (
                  <Check className="text-green-400 mt-1" size={20} />
                ) : (
                  <Clock className="text-yellow-400 mt-1" size={20} />
                )}
                
                <div className="flex-1">
                  <h4 className={`font-bold ${challenge.completed ? 'text-green-400' : 'text-white'}`}>
                    {challenge.title}
                  </h4>
                  <p className="text-gray-400 text-sm mt-1">
                    {challenge.description}
                  </p>
                  
                  {/* Progress Bar */}
                  {!challenge.completed && challenge.target > 1 && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-400">Progress</span>
                        <span className="text-xs text-gray-400">
                          {challenge.progress} / {challenge.target}
                        </span>
                      </div>
                      <div className="w-full bg-slate-700 rounded-full h-2">
                        <div
                          className="bg-primary-500 h-2 rounded-full transition-all"
                          style={{ 
                            width: `${Math.min((challenge.progress / challenge.target) * 100, 100)}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-2 mt-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-primary-500/20 text-primary-400">
                      +{challenge.xpReward} XP
                    </span>
                    {challenge.completed && (
                      <span className="text-xs text-green-400">
                        ✓ Completed
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Total XP */}
      {challenges.completedCount > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-700 text-center">
          <div className="text-2xl font-bold text-yellow-400">
            +{challenges.totalXPEarned} XP
          </div>
          <div className="text-sm text-gray-400">
            Earned from challenges today
          </div>
        </div>
      )}
    </div>
  );
}

export default DailyChallenges;