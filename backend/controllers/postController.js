const Post = require('../models/Post');
const User = require('../models/User');

// ════════════════════════════════════════════════════════════
// @desc    Create new post
// @route   POST /api/posts
// @access  Private
// ════════════════════════════════════════════════════════════
exports.createPost = async (req, res) => {
  try {
    const { content, type, linkedEntry, linkedGoal, linkedBadge, isPublic, team } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Content is required'
      });
    }

    const post = await Post.create({
      user: req.user._id,
      content,
      type: type || 'update',
      linkedEntry: linkedEntry || null,
      linkedGoal: linkedGoal || null,
      linkedBadge: linkedBadge || null,
      isPublic: isPublic !== undefined ? isPublic : true,
      team: team || null
    });

    // Populate user info
    await post.populate('user', 'name email xp level streak');

    res.status(201).json({
      success: true,
      message: 'Post created successfully!',
      data: post
    });
  } catch (error) {
    console.error('Create Post Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create post',
      error: error.message
    });
  }
};

// ════════════════════════════════════════════════════════════
// @desc    Get community feed
// @route   GET /api/posts/feed
// @access  Private
// ════════════════════════════════════════════════════════════
exports.getFeed = async (req, res) => {
  try {
    const { type, limit = 20, page = 1 } = req.query;

    const filter = { isPublic: true, team: null };
    
    if (type && type !== 'all') {
      filter.type = type;
    }

    // ✅ OPTIMIZED: Run queries in parallel
    const [posts, total] = await Promise.all([
      Post.find(filter)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip((parseInt(page) - 1) * parseInt(limit))
        .populate('user', 'name xp level streak badges')
        .populate('comments.user', 'name')
        .populate('reactions.user', 'name')
        .lean(),
      Post.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      data: {
        posts,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get Feed Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch feed',
      error: error.message
    });
  }
};

// ════════════════════════════════════════════════════════════
// @desc    Get user's posts
// @route   GET /api/posts/my-posts
// @access  Private
// ════════════════════════════════════════════════════════════
exports.getMyPosts = async (req, res) => {
  try {
    const posts = await Post.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('comments.user', 'name')
      .populate('reactions.user', 'name');

    res.status(200).json({
      success: true,
      data: posts
    });
  } catch (error) {
    console.error('Get My Posts Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch posts',
      error: error.message
    });
  }
};

// ════════════════════════════════════════════════════════════
// @desc    Add reaction to post
// @route   POST /api/posts/:id/react
// @access  Private
// ════════════════════════════════════════════════════════════
exports.addReaction = async (req, res) => {
  try {
    const { type } = req.body; // heart, fire, clap, muscle, star

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    await post.addReaction(req.user._id, type);

    res.status(200).json({
      success: true,
      message: 'Reaction added',
      data: post.reactionCounts
    });
  } catch (error) {
    console.error('Add Reaction Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add reaction',
      error: error.message
    });
  }
};

// ════════════════════════════════════════════════════════════
// @desc    Remove reaction from post
// @route   DELETE /api/posts/:id/react
// @access  Private
// ════════════════════════════════════════════════════════════
exports.removeReaction = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    await post.removeReaction(req.user._id);

    res.status(200).json({
      success: true,
      message: 'Reaction removed'
    });
  } catch (error) {
    console.error('Remove Reaction Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove reaction',
      error: error.message
    });
  }
};

// ════════════════════════════════════════════════════════════
// @desc    Add comment to post
// @route   POST /api/posts/:id/comment
// @access  Private
// ════════════════════════════════════════════════════════════
exports.addComment = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required'
      });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    await post.addComment(req.user._id, content);
    await post.populate('comments.user', 'name');

    res.status(200).json({
      success: true,
      message: 'Comment added',
      data: post.comments
    });
  } catch (error) {
    console.error('Add Comment Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add comment',
      error: error.message
    });
  }
};

// ════════════════════════════════════════════════════════════
// @desc    Delete comment
// @route   DELETE /api/posts/:id/comment/:commentId
// @access  Private
// ════════════════════════════════════════════════════════════
exports.deleteComment = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    const comment = post.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    // Check ownership
    if (comment.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    await post.deleteComment(req.params.commentId);

    res.status(200).json({
      success: true,
      message: 'Comment deleted'
    });
  } catch (error) {
    console.error('Delete Comment Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete comment',
      error: error.message
    });
  }
};

// ════════════════════════════════════════════════════════════
// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private
// ════════════════════════════════════════════════════════════
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    await post.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Post deleted'
    });
  } catch (error) {
    console.error('Delete Post Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete post',
      error: error.message
    });
  }
};

module.exports = exports;