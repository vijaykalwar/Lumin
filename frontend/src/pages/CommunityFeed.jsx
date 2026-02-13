import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { postsAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { Heart, Flame, ThumbsUp, Dumbbell, Star, MessageCircle, Send, Trash2, Filter } from 'lucide-react';

function CommunityFeed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [newPost, setNewPost] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [commentInputs, setCommentInputs] = useState({});
  
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchFeed();
  }, [filter]);

  const fetchFeed = async () => {
    setLoading(true);
    const result = await postsAPI.getFeed(filter);
    if (result.success) {
      setPosts(result.data.posts);
    }
    setLoading(false);
  };

  const handleCreatePost = async () => {
    if (!newPost.trim()) return;

    const result = await postsAPI.create({
      content: newPost,
      type: 'update',
      isPublic: true
    });

    if (result.success) {
      setNewPost('');
      setShowCreateModal(false);
      fetchFeed();
    }
  };

  const handleReaction = async (postId, reactionType) => {
    const result = await postsAPI.addReaction(postId, reactionType);
    if (result.success) {
      fetchFeed();
    }
  };

  const handleComment = async (postId) => {
    const content = commentInputs[postId];
    if (!content?.trim()) return;

    const result = await postsAPI.addComment(postId, content);
    if (result.success) {
      setCommentInputs({ ...commentInputs, [postId]: '' });
      fetchFeed();
    }
  };

  const handleDeletePost = async (postId) => {
    if (!confirm('Delete this post?')) return;

    const result = await postsAPI.delete(postId);
    if (result.success) {
      fetchFeed();
    }
  };

  const reactionIcons = {
    heart: { icon: Heart, color: 'text-red-400', label: '❤️' },
    fire: { icon: Flame, color: 'text-orange-400', label: '🔥' },
    clap: { icon: ThumbsUp, color: 'text-blue-400', label: '👏' },
    muscle: { icon: Dumbbell, color: 'text-green-400', label: '💪' },
    star: { icon: Star, color: 'text-yellow-400', label: '⭐' }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Community Feed</h1>
            <p className="text-gray-400">Share your journey with others</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
          >
            ➕ Create Post
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="card mb-6">
          <div className="flex items-center space-x-2">
            <Filter size={20} className="text-gray-400" />
            <div className="flex space-x-2 overflow-x-auto">
              {['all', 'update', 'achievement', 'goal', 'streak'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg capitalize whitespace-nowrap transition ${
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

        {/* Posts */}
        {loading ? (
          <div className="text-center text-white py-20">
            <div className="spinner mx-auto mb-4"></div>
            <p>Loading feed...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="card text-center py-20">
            <div className="text-6xl mb-4">📢</div>
            <h2 className="text-2xl font-bold text-white mb-2">No posts yet</h2>
            <p className="text-gray-400 mb-6">Be the first to share something!</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              Create First Post
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <div key={post._id} className="card">
                
                {/* Post Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-lg">
                        {post.user?.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="font-bold text-white">{post.user?.name}</div>
                      <div className="text-sm text-gray-400">
                        Level {post.user?.level} • {post.user?.xp} XP
                        {post.user?.streak > 0 && ` • 🔥 ${post.user.streak} day streak`}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  {post.user?._id === user?.id && (
                    <button
                      onClick={() => handleDeletePost(post._id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>

                {/* Post Type Badge */}
                <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 ${
                  post.type === 'achievement' ? 'bg-yellow-500/20 text-yellow-400' :
                  post.type === 'goal' ? 'bg-blue-500/20 text-blue-400' :
                  post.type === 'streak' ? 'bg-orange-500/20 text-orange-400' :
                  'bg-green-500/20 text-green-400'
                }`}>
                  {post.type}
                </div>

                {/* Post Content */}
                <p className="text-white mb-4 whitespace-pre-wrap">{post.content}</p>

                {/* Reactions */}
                <div className="flex items-center space-x-6 mb-4 pb-4 border-b border-slate-700">
                  {Object.entries(reactionIcons).map(([key, { icon: Icon, color, label }]) => {
                    const count = post.reactionCounts?.[key] || 0;
                    return (
                      <button
                        key={key}
                        onClick={() => handleReaction(post._id, key)}
                        className={`flex items-center space-x-1 transition hover:scale-110 ${
                          count > 0 ? color : 'text-gray-500'
                        }`}
                      >
                        <Icon size={20} />
                        {count > 0 && <span className="text-sm font-semibold">{count}</span>}
                      </button>
                    );
                  })}
                  <div className="flex items-center space-x-1 text-gray-400">
                    <MessageCircle size={20} />
                    <span className="text-sm">{post.commentCount || 0}</span>
                  </div>
                </div>

                {/* Comments */}
                {post.comments && post.comments.length > 0 && (
                  <div className="space-y-3 mb-4">
                    {post.comments.map((comment) => (
                      <div key={comment._id} className="flex space-x-3 p-3 bg-slate-800/50 rounded-lg">
                        <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-sm">
                            {comment.user?.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-white text-sm">{comment.user?.name}</div>
                          <p className="text-gray-300 text-sm">{comment.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Comment */}
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={commentInputs[post._id] || ''}
                    onChange={(e) => setCommentInputs({ ...commentInputs, [post._id]: e.target.value })}
                    onKeyPress={(e) => e.key === 'Enter' && handleComment(post._id)}
                    placeholder="Add a comment..."
                    className="input-field flex-1"
                  />
                  <button
                    onClick={() => handleComment(post._id)}
                    className="btn-primary px-4"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="card max-w-lg w-full animate-scaleIn">
            <h2 className="text-2xl font-bold text-white mb-4">Create Post</h2>
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="Share your progress, achievement, or thoughts..."
              className="input-field min-h-[150px] mb-4"
              maxLength={1000}
            />
            <div className="text-sm text-gray-400 mb-4">
              {newPost.length} / 1000 characters
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleCreatePost}
                disabled={!newPost.trim()}
                className="btn-primary flex-1"
              >
                Post
              </button>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setNewPost('');
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

export default CommunityFeed;