require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const http = require('http');
const { Server } = require('socket.io');

const authRoutes = require('./modules/auth/auth.routes');
const userRoutes = require('./modules/users/user.routes');
const announcementRoutes = require('./modules/announcements/announcement.routes');
const attendanceRoutes = require('./modules/attendance/attendance.routes');
const resourceRoutes = require('./modules/resources/resource.routes');
const doubtRoutes = require('./modules/doubts/doubt.routes');
const { seedAdmin } = require('./modules/auth/auth.controller');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
  }
});

// Socket.io Logic
io.on('connection', (socket) => {
  console.log('User connected to socket:', socket.id);

  socket.on('join_batch', (batch) => {
    socket.join(batch);
    console.log(`Socket ${socket.id} joined batch: ${batch}`);
  });

  socket.on('send_message', (data) => {
    // Broadcast the newly created message object to everyone in the batch room
    if (data.batch) {
      io.to(data.batch).emit('receive_message', data.message);
    }
  });

  socket.on('delete_message', (data) => {
    // Broadcast the ID of the deleted message to remove it from UI
    if (data.batch) {
      io.to(data.batch).emit('message_deleted', data.messageId);
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected from socket:', socket.id);
  });
});

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/doubts', doubtRoutes);

// Basic health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API is running' });
});

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to MongoDB');
    await seedAdmin(); // Ensure default admin exists
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB', err);
  });
