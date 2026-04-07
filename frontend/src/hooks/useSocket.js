import { io } from 'socket.io-client';
import { useEffect, useRef, useState, useCallback } from 'react';

const SOCKET_URL = 'http://localhost:3001';

let socketInstance = null;

function getSocket() {
  if (!socketInstance) {
    socketInstance = io(SOCKET_URL, {
      autoConnect: false,
      transports: ['websocket', 'polling'],
    });
  }
  return socketInstance;
}

export function useSocket() {
  const socketRef = useRef(getSocket());
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = socketRef.current;

    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);

    if (!socket.connected) {
      socket.connect();
    }

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
    };
  }, []);

  const emit = useCallback((event, data) => {
    socketRef.current.emit(event, data);
  }, []);

  const on = useCallback((event, handler) => {
    socketRef.current.on(event, handler);
    return () => socketRef.current.off(event, handler);
  }, []);

  const off = useCallback((event, handler) => {
    socketRef.current.off(event, handler);
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    emit,
    on,
    off,
  };
}
