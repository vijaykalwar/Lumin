import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { teamsAPI } from '../utils/api';
import { Users, Plus, LogIn, Copy, Crown, Trophy, TrendingUp } from 'lucide-react';
import { showToast } from '../utils/toast';
function Teams() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  
  // Create form
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPrivate: false,
    maxMembers: 20
  });
  
  // Join form
  const [inviteCode, setInviteCode] = useState('');
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    setLoading(true);
    const result = await teamsAPI.getMyTeams();
    if (result.success) {
      setTeams(result.data);
    }
    setLoading(false);
  };

  const handleCreateTeam = async () => {
    if (!formData.name.trim()) {
     showToast.error('Team name is required');
      return;
    }

    const result = await teamsAPI.create(formData);
    
    if (result.success) {
     showToast.success(`Team created! Invite code: ${result.data.inviteCode}`);
      setShowCreateModal(false);
      setFormData({ name: '', description: '', isPrivate: false, maxMembers: 20 });
      fetchTeams();
    } else {
     showToast.success(result.message);
    }
  };

  const handleJoinTeam = async () => {
    if (!inviteCode.trim()) {
      showToast.error('Invite code is required');
      return;
    }

    const result = await teamsAPI.join(inviteCode);
    
    if (result.success) {
     showToast.success(result.message);
      setShowJoinModal(false);
      setInviteCode('');
      fetchTeams();
    } else {
     showToast.errort(result.message);
    }
  };

  const copyInviteCode = (code) => {
    navigator.clipboard.writeText(code);
    showToast.success('Invite code copied!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">My Teams</h1>
            <p className="text-gray-400">Collaborate and grow together</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowJoinModal(true)}
              className="btn-secondary flex items-center space-x-2"
            >
              <LogIn size={20} />
              <span>Join Team</span>
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary flex items-center space-x-2"
            >
              <Plus size={20} />
              <span>Create Team</span>
            </button>
          </div>
        </div>

        {/* Teams Grid */}
        {loading ? (
          <div className="text-center text-white py-20">
            <div className="spinner mx-auto mb-4"></div>
            <p>Loading teams...</p>
          </div>
        ) : teams.length === 0 ? (
          <div className="card text-center py-20">
            <div className="text-6xl mb-4">👥</div>
            <h2 className="text-2xl font-bold text-white mb-2">No teams yet</h2>
            <p className="text-gray-400 mb-6">Create a team or join one with an invite code</p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary"
              >
                Create Team
              </button>
              <button
                onClick={() => setShowJoinModal(true)}
                className="btn-secondary"
              >
                Join Team
              </button>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((team) => (
              <div
                key={team._id}
                onClick={() => navigate(`/teams/${team._id}`)}
                className="card hover:scale-105 transition cursor-pointer"
              >
                {/* Team Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                      <Users size={24} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{team.name}</h3>
                      <p className="text-sm text-gray-400">{team.memberCount} members</p>
                    </div>
                  </div>
                  {team.owner === team.owner._id && (
                    <Crown size={20} className="text-yellow-400" />
                  )}
                </div>

                {/* Description */}
                {team.description && (
                  <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                    {team.description}
                  </p>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                    <div className="text-2xl font-bold text-primary-400">
                      {team.totalTeamXP || 0}
                    </div>
                    <div className="text-xs text-gray-400">Team XP</div>
                  </div>
                  <div className="text-center p-3 bg-slate-800/50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-400">
                      {team.teamStreak || 0}
                    </div>
                    <div className="text-xs text-gray-400">Team Streak</div>
                  </div>
                </div>

                {/* Invite Code */}
                {team.inviteCode && (
                  <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                    <div>
                      <div className="text-xs text-gray-400">Invite Code</div>
                      <div className="font-mono font-bold text-primary-400">
                        {team.inviteCode}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyInviteCode(team.inviteCode);
                      }}
                      className="p-2 hover:bg-slate-700 rounded-lg transition"
                    >
                      <Copy size={18} className="text-gray-400" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Team Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card max-w-lg w-full animate-scaleIn">
            <h2 className="text-2xl font-bold text-white mb-6">Create New Team</h2>
            
            <div className="space-y-4">
              <div>
                <label className="input-label">Team Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter team name"
                  className="input-field"
                  maxLength={100}
                />
              </div>

              <div>
                <label className="input-label">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="What's this team about?"
                  className="input-field min-h-[100px]"
                  maxLength={500}
                />
              </div>

              <div>
                <label className="input-label">Max Members</label>
                <input
                  type="number"
                  value={formData.maxMembers}
                  onChange={(e) => setFormData({ ...formData, maxMembers: parseInt(e.target.value) })}
                  min={2}
                  max={100}
                  className="input-field"
                />
              </div>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.isPrivate}
                  onChange={(e) => setFormData({ ...formData, isPrivate: e.target.checked })}
                  className="w-5 h-5"
                />
                <span className="text-white">Private Team (invite only)</span>
              </label>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleCreateTeam}
                className="btn-primary flex-1"
              >
                Create Team
              </button>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setFormData({ name: '', description: '', isPrivate: false, maxMembers: 20 });
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Join Team Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card max-w-md w-full animate-scaleIn">
            <h2 className="text-2xl font-bold text-white mb-6">Join a Team</h2>
            
            <div className="mb-6">
              <label className="input-label">Enter Invite Code</label>
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                placeholder="e.g. ABC123XY"
                className="input-field font-mono text-lg text-center"
                maxLength={8}
              />
              <p className="text-sm text-gray-400 mt-2">
                Ask the team owner for the invite code
              </p>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleJoinTeam}
                disabled={!inviteCode.trim()}
                className="btn-primary flex-1"
              >
                Join Team
              </button>
              <button
                onClick={() => {
                  setShowJoinModal(false);
                  setInviteCode('');
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Teams;