import { useRef, useEffect } from 'react';
import { WORLD_WIDTH, WORLD_HEIGHT, ZONES } from '../canvas/officeMap';

const MAP_W = 200;
const MAP_H = (WORLD_HEIGHT / WORLD_WIDTH) * MAP_W;
const SCALE_X = MAP_W / WORLD_WIDTH;
const SCALE_Y = MAP_H / WORLD_HEIGHT;

export default function Minimap({ allUsers, selfId, selfPosition }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = MAP_W * dpr;
    canvas.height = MAP_H * dpr;
    ctx.scale(dpr, dpr);

    // Clear
    ctx.clearRect(0, 0, MAP_W, MAP_H);

    // Background
    ctx.fillStyle = '#080c16';
    ctx.fillRect(0, 0, MAP_W, MAP_H);

    // Draw zones
    for (const zone of ZONES) {
      ctx.fillStyle = `rgba(30, 41, 59, 0.5)`;
      ctx.strokeStyle = zone.labelColor;
      ctx.lineWidth = 0.5;
      const x = zone.x * SCALE_X;
      const y = zone.y * SCALE_Y;
      const w = zone.w * SCALE_X;
      const h = zone.h * SCALE_Y;
      ctx.beginPath();
      ctx.roundRect(x, y, w, h, 2);
      ctx.fill();
      ctx.stroke();
    }

    // Draw remote players
    for (const user of allUsers) {
      if (user.id === selfId) continue;
      const px = user.x * SCALE_X;
      const py = user.y * SCALE_Y;
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.arc(px, py, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Draw self
    if (selfPosition) {
      const px = selfPosition.x * SCALE_X;
      const py = selfPosition.y * SCALE_Y;

      // Glow
      ctx.fillStyle = 'rgba(99, 102, 241, 0.3)';
      ctx.beginPath();
      ctx.arc(px, py, 6, 0, Math.PI * 2);
      ctx.fill();

      // Dot
      ctx.fillStyle = '#6366f1';
      ctx.beginPath();
      ctx.arc(px, py, 3, 0, Math.PI * 2);
      ctx.fill();

      // Border
      ctx.strokeStyle = '#818cf8';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(px, py, 3, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Border
    ctx.strokeStyle = 'rgba(30, 41, 59, 0.8)';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, MAP_W, MAP_H);
  }, [allUsers, selfId, selfPosition]);

  return (
    <div className="fixed top-5 right-5 z-20 animate-fade-in">
      <div className="glass rounded-xl overflow-hidden"
           style={{ boxShadow: '0 0 30px rgba(0,0,0,0.3)' }}>
        <div className="px-3 py-1.5 border-b border-white/5 flex items-center gap-1.5">
          <span className="text-[10px] font-semibold text-cosmos-muted/60 uppercase tracking-wider">
            🗺️ Map
          </span>
        </div>
        <canvas
          ref={canvasRef}
          style={{ width: MAP_W, height: MAP_H, display: 'block' }}
        />
      </div>
    </div>
  );
}
