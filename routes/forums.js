const express = require('express');
const Forum = require('../models/Forum');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get all forum posts
router.get('/', async (req, res) => {
  try {
    const { category, subject } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (subject) filter.subject = subject;

    const posts = await Forum.find(filter)
      .populate('author', 'name role department')
      .populate('replies.author', 'name role')
      .sort({ isPinned: -1, createdAt: -1 });

    // Filter out posts with deleted authors or provide default values
    const validPosts = posts.map(post => {
      const postObj = post.toObject();
      if (!postObj.author) {
        postObj.author = {
          name: 'Deleted User',
          role: 'unknown',
          department: 'N/A'
        };
      }
      return postObj;
    });

    res.json(validPosts);
  } catch (error) {
    console.error('Forums route error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create forum post
router.post('/', auth, async (req, res) => {
  try {
    const { title, content, category, subject } = req.body;

    const post = new Forum({
      title,
      content,
      category,
      subject,
      author: req.user._id
    });

    await post.save();
    await post.populate('author', 'name role department');

    res.status(201).json({
      message: 'Post created successfully',
      post
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single post
router.get('/:id', async (req, res) => {
  try {
    const post = await Forum.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate('author', 'name role department')
      .populate('replies.author', 'name role');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Handle deleted author
    const postObj = post.toObject();
    if (!postObj.author) {
      postObj.author = {
        name: 'Deleted User',
        role: 'unknown',
        department: 'N/A'
      };
    }

    res.json(postObj);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add reply
router.post('/:id/reply', auth, async (req, res) => {
  try {
    const { content } = req.body;

    const post = await Forum.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    post.replies.push({
      content,
      author: req.user._id
    });

    await post.save();
    await post.populate('replies.author', 'name role');

    res.json({
      message: 'Reply added successfully',
      reply: post.replies[post.replies.length - 1]
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Like post
router.post('/:id/like', auth, async (req, res) => {
  try {
    const post = await Forum.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const likeIndex = post.likes.indexOf(req.user._id);
    if (likeIndex > -1) {
      post.likes.splice(likeIndex, 1);
    } else {
      post.likes.push(req.user._id);
    }

    await post.save();

    res.json({
      message: 'Like updated',
      likes: post.likes.length
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Mark as resolved
router.patch('/:id/resolve', auth, async (req, res) => {
  try {
    const post = await Forum.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Only author or admin can mark as resolved
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    post.isResolved = !post.isResolved;
    await post.save();

    res.json({
      message: `Post marked as ${post.isResolved ? 'resolved' : 'unresolved'}`,
      isResolved: post.isResolved
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;