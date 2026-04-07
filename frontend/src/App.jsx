import { useState, useCallback, useRef, useEffect } from 'react';
import { useSocket } from './hooks/useSocket';
import JoinScreen from './components/JoinScreen';
import OfficeCanvas from './canvas/OfficeCanvas';
import ChatPanel from './components/ChatPanel';
import Sidebar from './components/Sidebar';
import Minimap from './components/Minimap';

export default function App() {
  const { socket, isConnected } = useSocket();
  const [screen, setScreen] = useState('join'); // 'join' | 'office'
  const [selfData, setSelfData] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [nearbyUsers, setNearbyUsers] = useState([]);
  const [connectedUser, setConnectedUser] = useState(null);
  const [selfPosition, setSelfPosition] = useState(null);
  const positionInterval = useRef(null);

  // Join handler
  const handleJoin = useCallback(({ username, avatarStyle }) => {
    socket.emit('join', { username, avatarStyle });
  }, [socket]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const onJoined = ({ self, users }) => {
      setSelfData(self);
      setAllUsers(users);
      setSelfPosition({ x: self.x, y: self.y });
      setScreen('office');
    };

    const onUserJoined = (userData) => {
      setAllUsers((prev) => {
        if (prev.find((u) => u.id === userData.id)) return prev;
        return [...prev, userData];
      });
    };

    const onUserMoved = ({ id, x, y }) => {
      setAllUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, x, y } : u))
      );
    };

    const onUserLeft = ({ id }) => {
      setAllUsers((prev) => prev.filter((u) => u.id !== id));
      if (connectedUser === id) {
        setConnectedUser(null);
      }
    };

    socket.on('joined', onJoined);
    socket.on('user:joined', onUserJoined);
    socket.on('user:moved', onUserMoved);
    socket.on('user:left', onUserLeft);

    return () => {
      socket.off('joined', onJoined);
      socket.off('user:joined', onUserJoined);
      socket.off('user:moved', onUserMoved);
      socket.off('user:left', onUserLeft);
    };
  }, [socket, connectedUser]);

  // Track self position from canvas (for minimap)
  useEffect(() => {
    if (screen !== 'office') return;
    const updatePosition = () => {
      // Read from the canvas's world container to stay in sync
      // This is a lightweight polling approach
    };
    positionInterval.current = setInterval(updatePosition, 200);
    return () => clearInterval(positionInterval.current);
  }, [screen]);

  // Proximity change handler from canvas
  const handleProximityChange = useCallback(({ nearbyUsers: nearby, connectedUser: connected }) => {
    setNearbyUsers(nearby || []);
    setConnectedUser(connected || null);
  }, []);

  // Get connected user data
  const connectedUserData = allUsers.find((u) => u.id === connectedUser);

  if (screen === 'join') {
    return (
      <>
        <JoinScreen onJoin={handleJoin} />
        {/* Connection status indicator */}
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium
            ${isConnected ? 'glass text-cosmos-success' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-cosmos-success animate-pulse' : 'bg-red-500'}`} />
            {isConnected ? 'Connected to server' : 'Connecting...'}
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="relative w-full h-full">
      {/* PixiJS Canvas */}
      <OfficeCanvas
        socket={socket}
        selfData={selfData}
        users={allUsers}
        onProximityChange={handleProximityChange}
      />

      {/* Overlay UI */}
      <Sidebar
        allUsers={allUsers}
        nearbyUsers={nearbyUsers}
        connectedUser={connectedUser}
        selfId={selfData?.id}
      />

      <Minimap
        allUsers={allUsers}
        selfId={selfData?.id}
        selfPosition={selfPosition}
      />

      <ChatPanel
        socket={socket}
        selfId={selfData?.id}
        connectedUser={connectedUser}
        connectedUserData={connectedUserData}
      />

      {/* Bottom center zone label */}
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-20">
        <div className="glass rounded-full px-4 py-2 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cosmos-success animate-pulse" />
          <span className="text-xs font-medium text-cosmos-muted">
            {selfData?.username} — Use <kbd className="px-1 py-0.5 rounded bg-cosmos-bg border border-cosmos-border text-[9px] font-mono mx-1">WASD</kbd> to move
          </span>
        </div>
      </div>
    </div>
  );
}
