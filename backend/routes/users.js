const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const Post = require('../models/Post');

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Check if user exists
    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    user = new User({
      username,
      email,
      password: hashedPassword,
    });

    await user.save();

    // Create token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', {
      expiresIn: '1d',
    });

    res.json({ token, user: { id: user._id, username: user.username, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret', {
      expiresIn: '1d',
    });

    res.json({ token, user: { id: user._id, username: user.username, email: user.email } });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { username, email, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    // Check if username or email is already taken
    if (username !== user.username || email !== user.email) {
      const existingUser = await User.findOne({
        $or: [
          { username, _id: { $ne: user._id } },
          { email, _id: { $ne: user._id } }
        ]
      });
      if (existingUser) {
        return res.status(400).json({ 
          message: 'Username or email is already taken' 
        });
      }
    }

    // If changing password, verify current password
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ 
          message: 'Current password is required to change password' 
        });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ 
          message: 'Current password is incorrect' 
        });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    user.username = username;
    user.email = email;
    await user.save();

    // Return user without password
    const updatedUser = await User.findById(user._id).select('-password');
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's liked posts
router.get('/me/liked-posts', auth, async (req, res) => {
  try {
    const posts = await Post.find({ likes: req.user.id })
      .populate('author', 'username')
      .sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's bookmarked posts
router.get('/me/bookmarks', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate({
        path: 'bookmarks',
        populate: { path: 'author', select: 'username' }
      });
    res.json(user.bookmarks);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Add bookmark
router.post('/bookmarks/:postId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (user.bookmarks.includes(req.params.postId)) {
      return res.status(400).json({ message: 'Post already bookmarked' });
    }
    user.bookmarks.push(req.params.postId);
    await user.save();
    res.json({ message: 'Post bookmarked successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove bookmark
router.delete('/bookmarks/:postId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.bookmarks = user.bookmarks.filter(id => id.toString() !== req.params.postId);
    await user.save();
    res.json({ message: 'Bookmark removed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 