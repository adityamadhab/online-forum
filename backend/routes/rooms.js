const express = require('express');
const router = express.Router();
const Room = require('../models/Room');
const auth = require('../middleware/auth');

// Get all rooms
router.get('/', async (req, res) => {
  try {
    const rooms = await Room.find()
      .populate('creator', 'username')
      .sort({ createdAt: -1 });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new room
router.post('/', auth, async (req, res) => {
  try {
    const { name, topic, description } = req.body;

    // Check if room name already exists
    const existingRoom = await Room.findOne({ name });
    if (existingRoom) {
      return res.status(400).json({ message: 'Room name already exists' });
    }

    const room = new Room({
      name,
      topic,
      description,
      creator: req.user.id,
      participants: [req.user.id]
    });

    await room.save();
    await room.populate('creator', 'username');
    res.json(room);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single room
router.get('/:id', async (req, res) => {
  try {
    const room = await Room.findById(req.params.id)
      .populate('creator', 'username')
      .populate('participants', 'username')
      .populate('messages.user', 'username');
    
    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }
    
    res.json(room);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update room
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, topic, description } = req.body;
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Check if user is the creator
    if (room.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Check if new name already exists
    if (name !== room.name) {
      const existingRoom = await Room.findOne({ name });
      if (existingRoom) {
        return res.status(400).json({ message: 'Room name already exists' });
      }
    }

    room.name = name;
    room.topic = topic;
    room.description = description;
    await room.save();

    res.json(room);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete room
router.delete('/:id', auth, async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Check if user is the creator
    if (room.creator.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    await room.deleteOne();
    res.json({ message: 'Room deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 