# Virtual Cosmos

A real-time 2D virtual office where users move around a shared space and automatically connect to chat when they come close to each other. When they move apart, the chat disconnects.

> 🎥 [Watch Demo on Loom](https://www.loom.com/share/289beb53d29d499296d9e59862cca896)

---

## Tech Stack

| Layer    | Technology                             |
|----------|----------------------------------------|
| Frontend | React 18, PixiJS 7, Tailwind CSS, Vite |
| Backend  | Node.js, Express, Socket.IO 4          |
| Database | MongoDB, Mongoose                      |
| Avatars  | DiceBear API v7                        |

### Tech Justification

- React + Vite: Fast dev server, component-based UI, matches the recommended stack.
- PixiJS 7: WebGL-accelerated 2D canvas renderer. Handles smooth avatar movement, animated connection lines, and real-time rendering at 60fps.
- Tailwind CSS: Utility-first styling for rapid UI development.
- Socket.IO 4: Handles real-time bidirectional events — position sync, chat, proximity state — with automatic reconnection.
- MongoDB + Mongoose: Persists user sessions (join time, position, avatar) and chat message history. Allows querying past messages between any two users via a REST endpoint.

---

## Features

### User Movement
- WASD keyboard controls
- Movement is bounded within the world dimensions
- Position updates broadcast to all connected users in real time and synced to MongoDB

### Real-Time Multiplayer
- All users are visible on the canvas simultaneously
- Remote avatar positions interpolate smoothly using lerp
- New users appear instantly; disconnected users are removed immediately

### Proximity Detection
- Two-tier radius system:
  - Nearby zone (180px): avatar highlights, user appears in the Nearby sidebar section
  - Connected zone (100px): the closest user within range becomes the active connection
- Proximity state recalculated every frame in the game loop
- State changes emitted to the server via `proximity:update`

### Chat System
- Chat panel slides in automatically when proximity connection is established
- Messages are private and scoped to the connected pair only
- Chat panel slides out when users move apart
- All messages are persisted to MongoDB
- Message history capped at 50 messages per session
- Keyboard input is isolated from movement controls while chat is focused

### UI/UX
- Lobby screen with avatar picker before entering the world
- Sidebar showing live user list grouped into: Connected, Nearby, In Office
- Each user entry shows avatar, username, and a color-coded status dot
- Connected user is badged with a "LINKED" label
- Animated pulsing connection line drawn between connected players with a midpoint glow dot
- Canvas minimap in the top-right corner showing all users and zone outlines
- Camera follows the local player with smooth lerp and boundary clamping

---

## Bonus Features

- Avatar customization: 6 DiceBear styles (Adventurer, Avataaars, Bottts, Micah, Mini, Personas) with 4 seed variants each, live preview on the join screen
- Detailed office map: distinct zones (workstations, lounge, meeting rooms, focus pods) with furniture — desks with monitors, sofas with armrests, office chairs with wheels, decorative plants
- Emoji picker: 16 preset emojis in the chat input
- File attachment: appends filename to the message input
- Camera capture: device camera image support in chat
- Minimap: canvas-based, DPR-aware, scales to full world dimensions
- Background grid and world border for spatial orientation
- REST API endpoint to fetch chat history between two users

---

## User Flow

1. User opens the app and lands on the join screen
2. Enters a username and picks an avatar style and variant
3. Clicks "Enter Lobby" and spawns into the 2D office world
4. Sees other users moving in real time on the canvas and minimap
5. Uses WASD to move toward another user
6. When within 180px, the other user's avatar highlights and they appear in the Nearby section
7. When within 100px, the chat panel slides in automatically — connection established
8. Both users can now send private messages to each other (messages saved to MongoDB)
9. When either user moves away beyond 100px, the chat panel slides out — connection terminated
10. The sidebar updates in real time to reflect current connection and proximity state

---

## Project Structure

```
virtual-cosmos/
  backend/
    index.js          # Express + Socket.IO + MongoDB server
    .env.example      # Environment variable template
    package.json
  frontend/
    src/
      canvas/
        OfficeCanvas.jsx  # Main PixiJS world, camera, connection lines
        Avatar.js         # Avatar sprite and state (nearby, connected)
        movement.js       # WASD movement controller
        officeMap.js      # Zone, furniture, and chair definitions
      components/
        JoinScreen.jsx    # Lobby UI with avatar picker
        ChatPanel.jsx     # Proximity chat with emoji and file support
        Sidebar.jsx       # Live user list with status sections
        Minimap.jsx       # Canvas minimap
      systems/
        proximity.js      # Distance-based proximity detection logic
      hooks/
        useSocket.js      # Socket.IO connection hook
      App.jsx
    package.json
  package.json            # Root scripts using concurrently
```

---

## Backend Socket Events

| Event              | Direction        | Description                                        |
|--------------------|------------------|----------------------------------------------------|
| `join`             | Client to Server | User joins with username and avatar config         |
| `joined`           | Server to Client | Returns self data and all current users            |
| `user:joined`      | Server broadcast | Notifies others of a new user                      |
| `move`             | Client to Server | Sends updated x, y position                       |
| `user:moved`       | Server broadcast | Relays position update to all other clients        |
| `chat:message`     | Client to Server | Sends a message to a specific connected user       |
| `chat:message`     | Server to Client | Delivers message to recipient and echoes to sender |
| `proximity:update` | Client to Server | Reports current nearby and connected user state    |
| `disconnect`       | Server           | Marks session end in MongoDB, notifies all clients |
| `user:left`        | Server broadcast | Notifies all clients that a user disconnected      |

## REST API

| Method | Endpoint                        | Description                              |
|--------|---------------------------------|------------------------------------------|
| GET    | `/api/messages/:userA/:userB`   | Fetch last 50 messages between two users |

---

## MongoDB Collections

| Collection    | Description                                              |
|---------------|----------------------------------------------------------|
| `usersessions`| Stores each user's socket ID, username, avatar, position, join time, and leave time |
| `chatmessages`| Stores all chat messages with sender, recipient, content, and timestamp |

---

## Getting Started

### Prerequisites
- Node.js 18 or higher
- npm
- MongoDB running locally or a MongoDB Atlas URI

### Install dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
```

### Configure environment

```bash
cd backend
cp .env.example .env
# Edit .env and set your MONGO_URI
```

### Run in development

```bash
# Backend on port 3001
cd backend && npm run dev

# Frontend via Vite
cd frontend && npm run dev
```

Or from the root using concurrently:

```bash
npm run dev
```

### Build for production

```bash
cd frontend && npm run build
```

---

## Controls

| Key   | Action       |
|-------|--------------|
| W     | Move up      |
| A     | Move left    |
| S     | Move down    |
| D     | Move right   |
| Enter | Send message |

---



## Demo Video

[Watch Demo on Loom](https://www.loom.com/share/289beb53d29d499296d9e59862cca896)

The demo video covers:
- User movement in the 2D office world
- Real-time multiplayer with multiple users visible
- Proximity detection triggering chat connect and disconnect
- Sidebar updating with Connected / Nearby / In Office sections
- Bonus features: avatar picker, emoji, minimap, office map zones
