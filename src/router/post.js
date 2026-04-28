const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');
const { postRules, commentRules } = require('../validators/post.validator');
const { upload } = require('../config/cloudinary');
const {
  createPost,
  getAllPosts,
  getPostsByUserId,
  getPostById,
  updatePost,
  deletePost,
  likePost,
  unlikePost,
  addComment,
  deleteComment,
  bookmarkPost,
  unbookmarkPost,
  getTrendingTags
} = require('../controllers/post.controller');

// @route   GET /api/posts/tags/trending
// @access  Public
router.get('/tags/trending', getTrendingTags);

// @route   POST /api/posts  (supports multipart/form-data for file attachments)
// @access  Private
router.post(
  '/',
  protect,
  upload.array('attachments', 3),
  postRules,
  validate,
  createPost
);

// @route   GET /api/posts?search=&page=1&limit=10
// @access  Public
router.get('/', getAllPosts);

// @route   GET /api/posts/user/:user_id
// @access  Public
router.get('/user/:user_id', getPostsByUserId);

// @route   GET /api/posts/:id
// @access  Public
router.get('/:id', getPostById);

// @route   PUT /api/posts/:id  (edit post text/tags)
// @access  Private
router.put('/:id', protect, postRules, validate, updatePost);

// @route   DELETE /api/posts/:id
// @access  Private
router.delete('/:id', protect, deletePost);

// @route   PUT /api/posts/like/:id
// @access  Private
router.put('/like/:id', protect, likePost);

// @route   PUT /api/posts/unlike/:id
// @access  Private
router.put('/unlike/:id', protect, unlikePost);

// @route   POST /api/posts/comment/:id
// @access  Private
router.post('/comment/:id', protect, commentRules, validate, addComment);

// @route   DELETE /api/posts/comment/:id/:comment_id
// @access  Private
router.delete('/comment/:id/:comment_id', protect, deleteComment);

// @route   PUT /api/posts/bookmark/:id
// @access  Private
router.put('/bookmark/:id', protect, bookmarkPost);

// @route   PUT /api/posts/unbookmark/:id
// @access  Private
router.put('/unbookmark/:id', protect, unbookmarkPost);

module.exports = router;
