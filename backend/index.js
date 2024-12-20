const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
const jwt = require('jsonwebtoken');
const Room = require('./models/Room');
const User = require('./models/User');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/forum_db')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes will be added here
app.use('/api/posts', require('./routes/posts'));
app.use('/api/comments', require('./routes/comments'));
app.use('/api/users', require('./routes/users'));
app.use('/api/rooms', require('./routes/rooms'));

// Socket.IO authentication middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    socket.userId = decoded.id;
    next();
  } catch (err) {
    next(new Error('Authentication error'));
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.userId);

  // Join room
  socket.on('join-room', async (roomId) => {
    try {
      const room = await Room.findById(roomId);
      if (!room) {
        socket.emit('error', 'Room not found');
        return;
      }

      socket.join(roomId);
      if (!room.participants.includes(socket.userId)) {
        room.participants.push(socket.userId);
        await room.save();
      }
      
      socket.emit('room-joined', room);
      socket.to(roomId).emit('user-joined', socket.userId);
    } catch (err) {
      socket.emit('error', 'Failed to join room');
    }
  });

  // Leave room
  socket.on('leave-room', async (roomId) => {
    socket.leave(roomId);
    socket.to(roomId).emit('user-left', socket.userId);
  });

  // New message
  socket.on('send-message', async ({ roomId, content }) => {
    try {
      const room = await Room.findById(roomId);
      if (!room) {
        socket.emit('error', 'Room not found');
        return;
      }

      const message = {
        user: socket.userId,
        content,
        createdAt: new Date()
      };

      room.messages.push(message);
      await room.save();

      io.to(roomId).emit('new-message', {
        ...message,
        user: await User.findById(socket.userId).select('username')
      });
    } catch (err) {
      socket.emit('error', 'Failed to send message');
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.userId);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
