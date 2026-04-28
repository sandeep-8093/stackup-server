const Post = require('../models/Post');
const { cloudinary } = require('../config/cloudinary');

/**
 * @desc    Create a new post (supports multipart/form-data with file attachments)
 * @route   POST /api/posts
 * @access  Private
 */
const createPost = async (req, res, next) => {
  try {
    // Build attachments from multer-uploaded files
    const attachments = (req.files || []).map(file => ({
      url:          file.path,            // Cloudinary secure URL
      publicId:     file.filename,        // Cloudinary public_id
      resourceType: file.mimetype.startsWith('image/') ? 'image' : 'raw',
      originalName: file.originalname,
      size:         file.size,
      format:       file.format || file.originalname.split('.').pop(),
    }));

    // tags may arrive as a comma-separated string (JSON body) or as repeated fields (FormData)
    let tags = req.body.tags || [];
    if (typeof tags === 'string') {
      tags = tags.split(',').map(t => t.trim()).filter(Boolean);
    }

    const newPost = new Post({
      text: req.body.text,
      name: req.user.name,
      avatar: req.user.avatar,
      user: req.user.id,
      tags,
      attachments,
    });

    const post = await newPost.save();
    res.status(201).json(post);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get all posts with optional search & pagination
 * @route   GET /api/posts?search=&page=1&limit=10
 * @access  Public
 */
const getAllPosts = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 10);
    const skip = (page - 1) * limit;

    let query = {};

    if (req.query.search) {
      const regex = new RegExp(req.query.search, 'i');
      query = { $or: [{ text: { $regex: regex } }, { name: { $regex: regex } }] };
    }

    if (req.query.user) {
      query.user = req.query.user;
    }

    const posts = await Post.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);

    res.json(posts);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get all posts by a specific user
 * @route   GET /api/posts/user/:user_id
 * @access  Public
 */
const getPostsByUserId = async (req, res, next) => {
  try {
    const posts = await Post.find({ user: req.params.user_id }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get a single post by ID
 * @route   GET /api/posts/:id
 * @access  Public
 */
const getPostById = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.views = (post.views || 0) + 1;
    await post.save();

    res.json(post);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Delete a post by ID (also removes Cloudinary assets)
 * @route   DELETE /api/posts/:id
 * @access  Private
 */
const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden: You are not the author of this post' });
    }

    // Clean up Cloudinary assets
    if (post.attachments && post.attachments.length > 0) {
      await Promise.all(
        post.attachments.map(att =>
          cloudinary.uploader.destroy(att.publicId, {
            resource_type: att.resourceType === 'image' ? 'image' : 'raw',
          }).catch(() => {}) // ignore cleanup errors
        )
      );
    }

    await post.deleteOne();
    res.json({ message: 'Post removed successfully' });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Like a post
 * @route   PUT /api/posts/like/:id
 * @access  Private
 */
const likePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.likes.some((like) => like.user.toString() === req.user.id)) {
      return res.status(400).json({ message: 'Post already liked' });
    }

    post.likes.unshift({ user: req.user.id });
    await post.save();
    res.json(post);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Unlike a post
 * @route   PUT /api/posts/unlike/:id
 * @access  Private
 */
const unlikePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (!post.likes.some((like) => like.user.toString() === req.user.id)) {
      return res.status(400).json({ message: 'Post has not been liked yet' });
    }

    post.likes = post.likes.filter(({ user }) => user.toString() !== req.user.id);
    await post.save();
    res.json(post);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Add a comment to a post
 * @route   POST /api/posts/comment/:id
 * @access  Private
 */
const addComment = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const newComment = {
      text: req.body.text,
      name: req.user.name,
      avatar: req.user.avatar,
      user: req.user.id,
    };

    post.comments.unshift(newComment);
    await post.save();
    res.status(201).json(post);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Delete a comment from a post
 * @route   DELETE /api/posts/comment/:id/:comment_id
 * @access  Private
 */
const deleteComment = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const comment = post.comments.find((c) => c.id === req.params.comment_id);

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const isCommentOwner = comment.user.toString() === req.user.id;
    const isPostOwner = post.user.toString() === req.user.id;

    if (!isCommentOwner && !isPostOwner) {
      return res.status(403).json({ message: 'Forbidden: Not authorized to delete this comment' });
    }

    post.comments = post.comments.filter(({ id }) => id !== req.params.comment_id);
    await post.save();
    res.json(post);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Bookmark a post
 * @route   PUT /api/posts/bookmark/:id
 * @access  Private
 */
const bookmarkPost = async (req, res, next) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user.id);

    if (user.bookmarks.includes(req.params.id)) {
      return res.status(400).json({ message: 'Post already bookmarked' });
    }

    user.bookmarks.unshift(req.params.id);
    await user.save();
    res.json(user.bookmarks);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Unbookmark a post
 * @route   PUT /api/posts/unbookmark/:id
 * @access  Private
 */
const unbookmarkPost = async (req, res, next) => {
  try {
    const User = require('../models/User');
    const user = await User.findById(req.user.id);

    if (!user.bookmarks.includes(req.params.id)) {
      return res.status(400).json({ message: 'Post has not been bookmarked' });
    }

    user.bookmarks = user.bookmarks.filter(
      (bookmark) => bookmark.toString() !== req.params.id
    );
    await user.save();
    res.json(user.bookmarks);
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Get trending tags using aggregation pipeline
 * @route   GET /api/posts/tags/trending
 * @access  Public
 */
const getTrendingTags = async (req, res, next) => {
  try {
    const tags = await Post.aggregate([
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { name: '$_id', count: 1, _id: 0 } }
    ]);
    res.json(tags);
  } catch (err) {
    next(err);
  }
};


/**
 * @desc    Update a post (text + tags only)
 * @route   PUT /api/posts/:id
 * @access  Private
 */
const updatePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (post.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden: You are not the author of this post' });
    }

    let tags = req.body.tags || post.tags;
    if (typeof tags === 'string') {
      tags = tags.split(',').map(t => t.trim()).filter(Boolean);
    }

    post.text = req.body.text || post.text;
    post.tags = tags;

    await post.save();
    res.json(post);
  } catch (err) {
    next(err);
  }
};
module.exports = {
  createPost,
  getAllPosts,
  getPostsByUserId,
  getPostById,
  deletePost,
  likePost,
  unlikePost,
  addComment,
  deleteComment,
  bookmarkPost,
  unbookmarkPost,
  getTrendingTags,
  updatePost,
};

