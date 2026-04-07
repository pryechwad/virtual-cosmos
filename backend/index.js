const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// In-memory user store
const users = new Map();

// Avatar presets (DiceBear Adventurer style)
const AVATAR_STYLES = ['adventurer', 'avataaars', 'bottts', 'micah', 'miniavs', 'personas'];

function generateAvatarUrl(seed, style = 'adventurer') {
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seed)}&radius=50`;
}

io.on('connection', (socket) => {
  console.log(`⚡ User connected: ${socket.id}`);

  socket.on('join', ({ username, avatarStyle, avatarSeed }) => {
    const style = avatarStyle || AVATAR_STYLES[Math.floor(Math.random() * AVATAR_STYLES.length)];
    const spawnX = 400 + Math.random() * 600;
    const spawnY = 400 + Math.random() * 400;

    const userData = {
      id: socket.id,
      username,
      avatarUrl: generateAvatarUrl(avatarSeed || username, style),
      avatarStyle: style,
      x: spawnX,
      y: spawnY,
      connected: true,
      joinedAt: Date.now(),
    };

    users.set(socket.id, userData);

    // Send current user their own data + all existing users
    socket.emit('joined', {
      self: userData,
      users: Array.from(users.values()),
    });

    // Broadcast new user to everyone else
    socket.broadcast.emit('user:joined', userData);

    console.log(`👤 ${username} joined (${socket.id})`);
  });

  socket.on('move', ({ x, y }) => {
    const user = users.get(socket.id);
    if (!user) return;

    user.x = x;
    user.y = y;

    socket.broadcast.emit('user:moved', {
      id: socket.id,
      x,
      y,
    });
  });

  socket.on('chat:message', ({ to, message }) => {
    const sender = users.get(socket.id);
    if (!sender) return;

    const payload = {
      from: socket.id,
      fromUsername: sender.username,
      fromAvatar: sender.avatarUrl,
      message,
      timestamp: Date.now(),
    };

    // Send to specific user
    io.to(to).emit('chat:message', payload);
    // Echo back to sender
    socket.emit('chat:message', payload);
  });

  socket.on('proximity:update', ({ nearbyUsers, connectedUser }) => {
    // Server can track proximity state if needed
    const user = users.get(socket.id);
    if (user) {
      user.nearbyUsers = nearbyUsers || [];
      user.connectedUser = connectedUser || null;
    }
  });

  socket.on('disconnect', () => {
    const user = users.get(socket.id);
    if (user) {
      console.log(`👋 ${user.username} left (${socket.id})`);
    }
    users.delete(socket.id);
    io.emit('user:left', { id: socket.id });
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Virtual Cosmos server running on port ${PORT}`);
});
