const express = require('express');
const router = express.Router();
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const auth = require('../middleware/auth');

// Create comment
router.post('/', auth, async (req, res) => {
  try {
    const { content, postId } = req.body;
    const comment = new Comment({
      content,
      author: req.user.id,
      post: postId,
    });
    await comment.save();
    
    // Add comment to post
    await Post.findByIdAndUpdate(postId, {
      $push: { comments: comment._id }
    });
    
    await comment.populate('author', 'username');
    res.json(comment);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete comment
router.delete('/:id', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user is the comment author
    if (comment.author.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Remove comment from post
    await Post.findByIdAndUpdate(comment.post, {
      $pull: { comments: comment._id }
    });

    await comment.deleteOne();
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 