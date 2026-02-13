import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { teamsAPI, postsAPI } from '../utils/api';
import { ArrowLeft, Users, Trophy, Crown, Copy, LogOut, MessageCircle, Send } from 'lucide-react';
import { showToast } from '../utils/toast';
function TeamDetail() {
  const [team, setTeam] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [feed, setFeed] = useState([]);
  const [activeTab, setActiveTab] = useState('feed'); // 'feed', 'leaderboard', 'members'
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTeamData();
  }, [id]);

  const fetchTeamData = async () => {
    setLoading(true);
    
    const [teamResult, leaderboardResult, feedResult] = await Promise.all([
      teamsAPI.getOne(id),
      teamsAPI.getLeaderboard(id),
      teamsAPI.getFeed(id)
    ]);

    if (teamResult.success) setTeam(teamResult.data);
    if (leaderboardResult.success) setLeaderboard(leaderboardResult.data);
    if (feedResult.success) setFeed(feedResult.data);

    setLoading(false);
  };

  const handlePostToTeam = async () => {
    if (!newPost.trim()) return;

    const result = await postsAPI.create({
      content: newPost,
      type: 'update',
      team: id
    });

    if (result.success) {
      setNewPost('');
      fetchTeamData();
    }
  };

  const handleLeaveTeam = async () => {
    if (!confirm('Are you sure you want to leave this team?')) return;

    const result = await teamsAPI.leave(id);
    if (result.success) {
      alert(result.message);
      navigate('/teams');
    }
  };

  const copyInviteCode = () => {
    navigator.clipboard.writeText(team.inviteCode);
    alert('Invite code copied!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-center">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-white">Loading team...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-950">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <p className="text-white">Team not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <button
          onClick={() => navigate('/teams')}
          className="flex items-center space-x-2 text-gray-400 hover:text-white mb-6 transition"
        >
          <ArrowLeft size={20} />
          <span>Back to Teams</span>
        </button>

        {/* Team Info Card */}
        <div className="card mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                <Users size={40} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">{team.name}</h1>
                <p className="text-gray-400">{team.description}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <span className="text-sm text-gray-400">
                    👥 {team.memberCount} members
                  </span>
                  {team.isPrivate && (
                    <span className="text-sm text-yellow-400">🔒 Private</span>
                  )}
                </div>
              </div>
            </div>
            
            <button
              onClick={handleLeaveTeam}
              className="btn-secondary flex items-center space-x-2"
            >
              <LogOut size={18} />
              <span>Leave Team</span>
            </button>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-slate-800/50 rounded-lg">
              <div className="text-3xl font-bold text-primary-400 mb-1">
                {team.totalTeamXP || 0}
              </div>
              <div className="text-sm text-gray-400">Total Team XP</div>
            </div>
            <div className="text-center p-4 bg-slate-800/50 rounded-lg">
              <div className="text-3xl font-bold text-orange-400 mb-1">
                {team.teamStreak || 0}
              </div>
              <div className="text-sm text-gray-400">Team Streak</div>
            </div>
            <div className="text-center p-4 bg-slate-800/50 rounded-lg">
              <div className="text-3xl font-bold text-green-400 mb-1">
                {team.sharedGoals?.length || 0}
              </div>
              <div className="text-sm text-gray-400">Shared Goals</div>
            </div>
          </div>

          {/* Invite Code */}
          {team.inviteCode && (
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-primary-500/10 to-accent-500/10 rounded-lg border border-primary-500/20">
              <div>
                <div className="text-sm text-gray-400 mb-1">Invite Code</div>
                <div className="text-2xl font-mono font-bold text-primary-400">
                  {team.inviteCode}
                </div>
              </div>
              <button
                onClick={copyInviteCode}
                className="btn-primary flex items-center space-x-2"
              >
                <Copy size={18} />
                <span>Copy</span>
              </button>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="card mb-6">
          <div className="flex space-x-2">
            {['feed', 'leaderboard', 'members'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 rounded-lg capitalize font-semibold transition ${
                  activeTab === tab
                    ? 'bg-primary-500 text-white'
                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'feed' && (
          <div className="space-y-6">
            {/* Create Post */}
            <div className="card">
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="Share an update with your team..."
                className="input-field min-h-[100px] mb-3"
              />
              <button
                onClick={handlePostToTeam}
                disabled={!newPost.trim()}
                className="btn-primary w-full"
              >
                Post to Team
              </button>
            </div>

            {/* Feed */}
            {feed.length === 0 ? (
              <div className="card text-center py-12">
                <MessageCircle size={48} className="mx-auto mb-4 text-gray-600" />
                <p className="text-gray-400">No posts yet. Be the first to share!</p>
              </div>
            ) : (
              feed.map(post => (
                <div key={post._id} className="card">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">
                        {post.user?.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="font-bold text-white">{post.user?.name}</div>
                      <div className="text-sm text-gray-400">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <p className="text-white whitespace-pre-wrap">{post.content}</p>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="card">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Trophy className="mr-2 text-yellow-400" size={28} />
              Team Leaderboard
            </h2>
            <div className="space-y-3">
              {leaderboard.map((member, index) => (
                <div
                  key={member.user._id}
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    index === 0
                      ? 'bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border-2 border-yellow-500/30'
                      : 'bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`text-2xl font-bold ${
                      index === 0 ? 'text-yellow-400' :
                      index === 1 ? 'text-gray-300' :
                      index === 2 ? 'text-orange-400' :
                      'text-gray-500'
                    }`}>
                      #{index + 1}
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">
                        {member.user.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-white">{member.user.name}</span>
                        {member.role === 'admin' && (
                          <Crown size={16} className="text-yellow-400" />
                        )}
                      </div>
                      <div className="text-sm text-gray-400">
                        Level {member.level} • 🔥 {member.streak} day streak
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary-400">
                      {member.totalXP}
                    </div>
                    <div className="text-xs text-gray-400">XP</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'members' && (
          <div className="card">
            <h2 className="text-2xl font-bold text-white mb-6">
              Team Members ({team.memberCount})
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              {team.members.map(member => (
                <div
                  key={member.user._id}
                  className="flex items-center space-x-3 p-4 bg-slate-800/50 rounded-lg"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">
                      {member.user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-white">{member.user.name}</span>
                      {member.role === 'admin' && (
                        <Crown size={16} className="text-yellow-400" />
                      )}
                    </div>
                    <div className="text-sm text-gray-400">
                      Level {member.user.level} • {member.user.xp} XP
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

export default TeamDetail;