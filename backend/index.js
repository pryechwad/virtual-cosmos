require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/virtual-cosmos')
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Schemas
const userSessionSchema = new mongoose.Schema({
  socketId:    { type: String, required: true, unique: true },
  username:    { type: String, required: true },
  avatarUrl:   { type: String },
  avatarStyle: { type: String },
  x:           { type: Number, default: 0 },
  y:           { type: Number, default: 0 },
  joinedAt:    { type: Date, default: Date.now },
  leftAt:      { type: Date, default: null },
});

const chatMessageSchema = new mongoose.Schema({
  from:        { type: String, required: true },
  to:          { type: String, required: true },
  fromUsername:{ type: String },
  message:     { type: String, required: true },
  timestamp:   { type: Date, default: Date.now },
});

const UserSession = mongoose.model('UserSession', userSessionSchema);
const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);

// In-memory active users (for real-time lookups)
const users = new Map();

const AVATAR_STYLES = ['adventurer', 'avataaars', 'bottts', 'micah', 'miniavs', 'personas'];

function generateAvatarUrl(seed, style = 'adventurer') {
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seed)}&radius=50`;
}

// REST: get chat history between two users
app.get('/api/messages/:userA/:userB', async (req, res) => {
  const { userA, userB } = req.params;
  try {
    const messages = await ChatMessage.find({
      $or: [
        { from: userA, to: userB },
        { from: userB, to: userA },
      ],
    })
      .sort({ timestamp: 1 })
      .limit(50);
    res.json(messages);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('join', async ({ username, avatarStyle, avatarSeed }) => {
    const style = avatarStyle || AVATAR_STYLES[Math.floor(Math.random() * AVATAR_STYLES.length)];
    const spawnX = 400 + Math.random() * 600;
    const spawnY = 400 + Math.random() * 400;
    const avatarUrl = generateAvatarUrl(avatarSeed || username, style);

    const userData = {
      id: socket.id,
      username,
      avatarUrl,
      avatarStyle: style,
      x: spawnX,
      y: spawnY,
      joinedAt: Date.now(),
    };

    users.set(socket.id, userData);

    // Persist session to MongoDB
    await UserSession.findOneAndUpdate(
      { socketId: socket.id },
      { socketId: socket.id, username, avatarUrl, avatarStyle: style, x: spawnX, y: spawnY, joinedAt: new Date(), leftAt: null },
      { upsert: true, new: true }
    );

    socket.emit('joined', { self: userData, users: Array.from(users.values()) });
    socket.broadcast.emit('user:joined', userData);

    console.log(`${username} joined (${socket.id})`);
  });

  socket.on('move', async ({ x, y }) => {
    const user = users.get(socket.id);
    if (!user) return;

    user.x = x;
    user.y = y;

    // Update position in MongoDB
    await UserSession.updateOne({ socketId: socket.id }, { x, y });

    socket.broadcast.emit('user:moved', { id: socket.id, x, y });
  });

  socket.on('chat:message', async ({ to, message }) => {
    const sender = users.get(socket.id);
    if (!sender) return;

    const payload = {
      from: socket.id,
      fromUsername: sender.username,
      fromAvatar: sender.avatarUrl,
      message,
      timestamp: Date.now(),
    };

    // Persist message to MongoDB
    await ChatMessage.create({
      from: socket.id,
      to,
      fromUsername: sender.username,
      message,
    });

    io.to(to).emit('chat:message', payload);
    socket.emit('chat:message', payload);
  });

  socket.on('proximity:update', ({ nearbyUsers, connectedUser }) => {
    const user = users.get(socket.id);
    if (user) {
      user.nearbyUsers = nearbyUsers || [];
      user.connectedUser = connectedUser || null;
    }
  });

  socket.on('disconnect', async () => {
    const user = users.get(socket.id);
    if (user) {
      console.log(`${user.username} left (${socket.id})`);
      await UserSession.updateOne({ socketId: socket.id }, { leftAt: new Date() });
    }
    users.delete(socket.id);
    io.emit('user:left', { id: socket.id });
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Virtual Cosmos server running on port ${PORT}`);
});
