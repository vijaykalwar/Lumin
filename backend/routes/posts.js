const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createPost,
  getFeed,
  getMyPosts,
  addReaction,
  removeReaction,
  addComment,
  deleteComment,
  deletePost
} = require('../controllers/postController');

// ════════════════════════════════════════════════════════════
// ALL ROUTES REQUIRE AUTHENTICATION
// ════════════════════════════════════════════════════════════

// Create post
router.post('/', protect, createPost);

// Get community feed
router.get('/feed', protect, getFeed);

// Get my posts
router.get('/my-posts', protect, getMyPosts);

// Add reaction
router.post('/:id/react', protect, addReaction);

// Remove reaction
router.delete('/:id/react', protect, removeReaction);

// Add comment
router.post('/:id/comment', protect, addComment);

// Delete comment
router.delete('/:id/comment/:commentId', protect, deleteComment);

// Delete post
router.delete('/:id', protect, deletePost);

module.exports = router;