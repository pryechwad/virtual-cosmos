// OfficeCanvas.jsx — Main PixiJS canvas: office map, avatars, camera, connections
import { useEffect, useRef, useCallback } from 'react';
import * as PIXI from 'pixi.js';
import { WORLD_WIDTH, WORLD_HEIGHT, ZONES, FURNITURE, CHAIRS, GRID } from './officeMap';
import { Avatar } from './Avatar';
import { MovementController } from './movement';
import { ProximitySystem } from '../systems/proximity';

export default function OfficeCanvas({ socket, selfData, users, onProximityChange, onChatMessage }) {
  const containerRef = useRef(null);
  const appRef = useRef(null);
  const avatarsRef = useRef(new Map());
  const localAvatarRef = useRef(null);
  const movementRef = useRef(null);
  const proximityRef = useRef(null);
  const connectionLineRef = useRef(null);
  const worldContainerRef = useRef(null);

  // Draw the office background, zones, furniture
  const drawOffice = useCallback((world) => {
    // Background
    const bg = new PIXI.Graphics();
    bg.beginFill(0xf8fafc); // Light Slate background
    bg.drawRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    bg.endFill();
    world.addChild(bg);

    // Grid pattern
    const grid = new PIXI.Graphics();
    grid.lineStyle(1, GRID.color, GRID.alpha);
    for (let x = 0; x <= WORLD_WIDTH; x += GRID.size) {
      grid.moveTo(x, 0);
      grid.lineTo(x, WORLD_HEIGHT);
    }
    for (let y = 0; y <= WORLD_HEIGHT; y += GRID.size) {
      grid.moveTo(0, y);
      grid.lineTo(WORLD_WIDTH, y);
    }
    world.addChild(grid);

    // Zones
    for (const zone of ZONES) {
      const g = new PIXI.Graphics();
      // Fill
      g.beginFill(zone.color, 0.6);
      g.drawRoundedRect(zone.x, zone.y, zone.w, zone.h, 12);
      g.endFill();
      // Border
      g.lineStyle(2, zone.borderColor, 0.5);
      g.drawRoundedRect(zone.x, zone.y, zone.w, zone.h, 12);
      world.addChild(g);

      // Zone label
      const label = new PIXI.Text(zone.label, {
        fontFamily: 'Inter, sans-serif',
        fontSize: 14,
        fontWeight: '600',
        fill: zone.labelColor,
        align: 'left',
      });
      label.x = zone.x + 14;
      label.y = zone.y + 10;
      label.alpha = 0.8;
      world.addChild(label);
    }

    // Furniture
    for (const item of FURNITURE) {
      const g = new PIXI.Graphics();
      
      if (item.type === 'table') {
        // Proper table with wooden gradient or distinct border
        g.beginFill(item.color || 0xd97706, 0.9);
        g.lineStyle(3, 0x000000, 0.1); // subtle shadow border
        if (item.rounded) {
          g.drawRoundedRect(item.x, item.y, item.w, item.h, 12);
        } else {
          g.drawRect(item.x, item.y, item.w, item.h);
        }
        g.endFill();
        // Inner highlight
        g.lineStyle(1, 0xffffff, 0.1);
        g.drawRoundedRect(item.x + 2, item.y + 2, item.w - 4, item.h - 4, 10);
      } 
      else if (item.type === 'sofa') {
        // Proper Sofa: Seat
        g.beginFill(item.color, 0.85);
        g.drawRoundedRect(item.x, item.y, item.w, item.h, 12);
        g.endFill();
        
        // Sofa backrest (top side)
        g.beginFill(item.color, 0.95);
        g.drawRoundedRect(item.x, item.y, item.w, 15, 6);
        g.endFill();
        
        // Sofa armrests
        g.beginFill(item.color, 0.7);
        g.drawRoundedRect(item.x, item.y, 16, item.h, 8); // left armrest
        g.drawRoundedRect(item.x + item.w - 16, item.y, 16, item.h, 8); // right armrest
        g.endFill();
      }
      else if (item.type === 'desk') {
        // Desk top
        g.beginFill(item.color, 0.9);
        g.drawRoundedRect(item.x, item.y, item.w, item.h, 4);
        g.endFill();

        // Monitor stand
        g.beginFill(0x0f172a, 0.8);
        g.drawRect(item.x + item.w / 2 - 10, item.y + 12, 20, 6);
        g.endFill();

        // Monitor
        g.beginFill(0x1e293b);
        g.drawRoundedRect(item.x + 15, item.y + 4, 50, 8, 2); // monitor looking up or thin
        g.endFill();
      }
      else if (item.type === 'plant') {
        // Pot
        g.beginFill(0x451a03);
        g.drawCircle(item.x + item.w / 2, item.y + item.h / 2, item.w / 2 - 2);
        g.endFill();
        // Leaves
        g.beginFill(item.color, 0.9);
        g.drawCircle(item.x + item.w / 2 - 4, item.y + item.h / 2 - 4, item.w / 2.5);
        g.drawCircle(item.x + item.w / 2 + 4, item.y + item.h / 2 + 3, item.w / 2.5);
        g.drawCircle(item.x + item.w / 2 + 2, item.y + item.h / 2 - 5, item.w / 2.5);
        g.endFill();
      } 
      else if (item.type === 'pod') {
        g.beginFill(item.color, 0.8);
        g.drawRoundedRect(item.x, item.y, item.w, item.h, 16);
        // Inner pod wall / acoustic panel
        g.beginFill(0x000000, 0.2);
        g.drawRoundedRect(item.x + 6, item.y + 6, item.w - 12, item.h - 12, 12);
        // Desk inside pod
        g.beginFill(0xe2e8f0, 0.8);
        g.drawRoundedRect(item.x + 12, item.y + 12, item.w - 24, 25, 4);
        g.endFill();
      } 
      else {
        g.beginFill(item.color, 0.7);
        if (item.rounded) g.drawRoundedRect(item.x, item.y, item.w, item.h, 8);
        else g.drawRect(item.x, item.y, item.w, item.h);
        g.endFill();
      }

      world.addChild(g);
    }

    // Proper Chairs
    for (const chair of CHAIRS) {
      const g = new PIXI.Graphics();
      
      // Wheels / Base
      g.beginFill(0x111827, 0.6);
      g.drawCircle(chair.x, chair.y, 14);
      g.endFill();
      
      // Cushion (Seat)
      g.beginFill(chair.color, 0.9);
      g.drawRoundedRect(chair.x - 10, chair.y - 10, 20, 20, 6);
      g.endFill();

      // Backrest
      g.beginFill(0x1f2937, 0.9);
      g.drawRoundedRect(chair.x - 12, chair.y + 6, 24, 8, 4);
      g.endFill();
      
      // Armrests
      g.beginFill(0x374151, 0.9);
      g.drawRoundedRect(chair.x - 14, chair.y - 4, 4, 12, 2); // left
      g.drawRoundedRect(chair.x + 10, chair.y - 4, 4, 12, 2); // right
      g.endFill();

      world.addChild(g);
    }

    // World border
    const border = new PIXI.Graphics();
    border.lineStyle(3, 0xe2e8f0, 0.8);
    border.drawRoundedRect(4, 4, WORLD_WIDTH - 8, WORLD_HEIGHT - 8, 16);
    world.addChild(border);
  }, []);

  // Initialize PixiJS app
  useEffect(() => {
    if (!containerRef.current || !selfData) return;

    const app = new PIXI.Application({
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: 0xf8fafc,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    containerRef.current.appendChild(app.view);
    appRef.current = app;

    // World container (everything moves within this)
    const world = new PIXI.Container();
    world.sortableChildren = true;
    world.scale.set(0.75); // Zoom out to 75% for "Proper Zoom"
    worldContainerRef.current = world;
    app.stage.addChild(world);

    // Draw office
    drawOffice(world);

    // Connection line graphics
    const connectionLine = new PIXI.Graphics();
    connectionLine.zIndex = 5;
    world.addChild(connectionLine);
    connectionLineRef.current = connectionLine;

    // Avatar layer
    const avatarLayer = new PIXI.Container();
    avatarLayer.sortableChildren = true;
    avatarLayer.zIndex = 10;
    world.addChild(avatarLayer);

    // Create local avatar
    const localAvatar = new Avatar({
      id: selfData.id,
      username: selfData.username,
      avatarUrl: selfData.avatarUrl,
      x: selfData.x,
      y: selfData.y,
      isLocal: true,
    });
    avatarLayer.addChild(localAvatar.container);
    localAvatarRef.current = localAvatar;

    // Create remote avatars for existing users
    for (const user of users) {
      if (user.id === selfData.id) continue;
      const avatar = new Avatar({
        id: user.id,
        username: user.username,
        avatarUrl: user.avatarUrl,
        x: user.x,
        y: user.y,
        isLocal: false,
      });
      avatarLayer.addChild(avatar.container);
      avatarsRef.current.set(user.id, avatar);
    }

    // Movement controller
    const movement = new MovementController(socket);
    movement.setPosition(selfData.x, selfData.y);
    movementRef.current = movement;

    // Proximity system
    const proximity = new ProximitySystem((state) => {
      if (onProximityChange) onProximityChange(state);
      socket.emit('proximity:update', state);
    });
    proximityRef.current = proximity;

    // Socket events
    const onUserJoined = (userData) => {
      if (avatarsRef.current.has(userData.id)) return;
      const avatar = new Avatar({
        id: userData.id,
        username: userData.username,
        avatarUrl: userData.avatarUrl,
        x: userData.x,
        y: userData.y,
        isLocal: false,
      });
      avatarLayer.addChild(avatar.container);
      avatarsRef.current.set(userData.id, avatar);
    };

    const onUserMoved = ({ id, x, y }) => {
      const avatar = avatarsRef.current.get(id);
      if (avatar) {
        avatar.targetX = x;
        avatar.targetY = y;
        avatar.isMoving = true;
        // Reset moving state after a delay
        clearTimeout(avatar._moveTimeout);
        avatar._moveTimeout = setTimeout(() => {
          avatar.isMoving = false;
        }, 200);
      }
    };

    const onUserLeft = ({ id }) => {
      const avatar = avatarsRef.current.get(id);
      if (avatar) {
        avatar.destroy();
        avatarsRef.current.delete(id);
      }
    };

    socket.on('user:joined', onUserJoined);
    socket.on('user:moved', onUserMoved);
    socket.on('user:left', onUserLeft);

    // Game loop
    app.ticker.add((delta) => {
      // Update movement
      const pos = movement.update(delta, WORLD_WIDTH, WORLD_HEIGHT);
      localAvatar.setPosition(pos.x, pos.y);
      localAvatar.isMoving = pos.isMoving;

      // Update all avatars
      localAvatar.update(delta);
      for (const [, avatar] of avatarsRef.current) {
        avatar.update(delta);
      }

      // Proximity check
      const proxState = proximity.update(pos.x, pos.y, avatarsRef.current);

      // Draw connection lines
      connectionLine.clear();
      if (proxState.connectedUser) {
        const remote = avatarsRef.current.get(proxState.connectedUser);
        if (remote) {
          const pulse = 0.3 + Math.sin(Date.now() * 0.004) * 0.2;
          connectionLine.lineStyle(2, 0x6366f1, pulse);
          connectionLine.moveTo(localAvatar.container.x, localAvatar.container.y);
          connectionLine.lineTo(remote.container.x, remote.container.y);

          // Midpoint glow
          const mx = (localAvatar.container.x + remote.container.x) / 2;
          const my = (localAvatar.container.y + remote.container.y) / 2;
          connectionLine.beginFill(0x6366f1, pulse * 0.5);
          connectionLine.drawCircle(mx, my, 6);
          connectionLine.endFill();
        }
      }

      // Camera follow
      const screenW = app.renderer.width / app.renderer.resolution;
      const screenH = app.renderer.height / app.renderer.resolution;
      const zoom = world.scale.x;
      
      const targetCamX = -pos.x * zoom + screenW / 2;
      const targetCamY = -pos.y * zoom + screenH / 2;
      
      // Clamp camera
      const camX = Math.min(0, Math.max(targetCamX, -(WORLD_WIDTH * zoom - screenW)));
      const camY = Math.min(0, Math.max(targetCamY, -(WORLD_HEIGHT * zoom - screenH)));
      
      // Smooth camera
      world.x += (camX - world.x) * 0.1;
      world.y += (camY - world.y) * 0.1;
    });

    // Resize handler
    const onResize = () => {
      app.renderer.resize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
      socket.off('user:joined', onUserJoined);
      socket.off('user:moved', onUserMoved);
      socket.off('user:left', onUserLeft);
      movement.destroy();
      proximity.destroy();
      app.destroy(true, { children: true });
    };
  }, [selfData, socket, drawOffice, onProximityChange, users]);

  return <div ref={containerRef} className="canvas-container" />;
}
