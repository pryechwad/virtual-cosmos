// Office map configuration — zones, furniture, and decorations
// Canvas world size: 3000 x 2000

export const WORLD_WIDTH = 3000;
export const WORLD_HEIGHT = 2000;

export const ZONES = [
  {
    id: 'main-hall',
    label: 'Main Hall',
    x: 100,
    y: 100,
    w: 800,
    h: 500,
    color: 0xebf4ff, // distinct blue-gray
    borderColor: 0x93c5fd,
    labelColor: '#1e3a8a',
  },
  {
    id: 'meeting-room-a',
    label: '🎯 Meeting Room A',
    x: 1000,
    y: 100,
    w: 450,
    h: 350,
    color: 0xe0e7ff, // indigo
    borderColor: 0x818cf8,
    labelColor: '#3730a3',
  },
  {
    id: 'meeting-room-b',
    label: '🎯 Meeting Room B',
    x: 1550,
    y: 100,
    w: 450,
    h: 350,
    color: 0xe0e7ff, // indigo
    borderColor: 0x818cf8,
    labelColor: '#3730a3',
  },
  {
    id: 'open-workspace',
    label: '💻 Open Workspace',
    x: 100,
    y: 700,
    w: 1200,
    h: 600,
    color: 0xf3f4f6, // soft gray
    borderColor: 0xd1d5db,
    labelColor: '#374151',
  },
  {
    id: 'collab-area',
    label: '🤝 Collaboration Zone',
    x: 1400,
    y: 550,
    w: 600,
    h: 450,
    color: 0xdcfce7, // green distinct
    borderColor: 0x86efac,
    labelColor: '#166534',
  },
  {
    id: 'lounge',
    label: '☕ Lounge',
    x: 2100,
    y: 100,
    w: 800,
    h: 500,
    color: 0xffedd5, // warm orange
    borderColor: 0xfdba74,
    labelColor: '#9a3412',
  },
  {
    id: 'focus-pods',
    label: '🎧 Focus Pods',
    x: 2100,
    y: 700,
    w: 800,
    h: 600,
    color: 0xcffafe, // distinct cyan
    borderColor: 0x67e8f9,
    labelColor: '#164e63',
  },
  {
    id: 'kitchen',
    label: '🍕 Kitchen',
    x: 100,
    y: 1400,
    w: 500,
    h: 500,
    color: 0xfef08a, // distinct yellow
    borderColor: 0xfacc15,
    labelColor: '#a16207',
  },
  {
    id: 'game-room',
    label: '🎮 Game Room',
    x: 700,
    y: 1400,
    w: 600,
    h: 500,
    color: 0xfce7f3, // distinct pink
    borderColor: 0xf9a8d4,
    labelColor: '#9d174d',
  },
  {
    id: 'outdoor-terrace',
    label: '🌿 Outdoor Terrace',
    x: 1400,
    y: 1100,
    w: 1500,
    h: 800,
    color: 0xd1fae5, // emerald green
    borderColor: 0x6ee7b7,
    labelColor: '#065f46',
  },
];

// Furniture / decoration items
export const FURNITURE = [
  // Main Hall desks
  { type: 'desk', x: 200, y: 200, w: 80, h: 50, color: 0xcbd5e1 },
  { type: 'desk', x: 350, y: 200, w: 80, h: 50, color: 0xcbd5e1 },
  { type: 'desk', x: 500, y: 200, w: 80, h: 50, color: 0xcbd5e1 },
  { type: 'desk', x: 200, y: 350, w: 80, h: 50, color: 0xcbd5e1 },
  { type: 'desk', x: 350, y: 350, w: 80, h: 50, color: 0xcbd5e1 },
  { type: 'desk', x: 500, y: 350, w: 80, h: 50, color: 0xcbd5e1 },
  { type: 'desk', x: 650, y: 200, w: 80, h: 50, color: 0xcbd5e1 },
  { type: 'desk', x: 650, y: 350, w: 80, h: 50, color: 0xcbd5e1 },

  // Meeting room tables
  { type: 'table', x: 1150, y: 220, w: 150, h: 80, color: 0x3730a3, rounded: true },
  { type: 'table', x: 1700, y: 220, w: 150, h: 80, color: 0x3730a3, rounded: true },

  // Open workspace desks (rows)
  { type: 'desk', x: 200, y: 800, w: 80, h: 50, color: 0x374151 },
  { type: 'desk', x: 350, y: 800, w: 80, h: 50, color: 0x374151 },
  { type: 'desk', x: 500, y: 800, w: 80, h: 50, color: 0x374151 },
  { type: 'desk', x: 650, y: 800, w: 80, h: 50, color: 0x374151 },
  { type: 'desk', x: 800, y: 800, w: 80, h: 50, color: 0x374151 },
  { type: 'desk', x: 950, y: 800, w: 80, h: 50, color: 0x374151 },
  { type: 'desk', x: 200, y: 950, w: 80, h: 50, color: 0x374151 },
  { type: 'desk', x: 350, y: 950, w: 80, h: 50, color: 0x374151 },
  { type: 'desk', x: 500, y: 950, w: 80, h: 50, color: 0x374151 },
  { type: 'desk', x: 650, y: 950, w: 80, h: 50, color: 0x374151 },
  { type: 'desk', x: 800, y: 950, w: 80, h: 50, color: 0x374151 },
  { type: 'desk', x: 950, y: 950, w: 80, h: 50, color: 0x374151 },
  { type: 'desk', x: 200, y: 1100, w: 80, h: 50, color: 0x374151 },
  { type: 'desk', x: 350, y: 1100, w: 80, h: 50, color: 0x374151 },
  { type: 'desk', x: 500, y: 1100, w: 80, h: 50, color: 0x374151 },
  { type: 'desk', x: 650, y: 1100, w: 80, h: 50, color: 0x374151 },
  { type: 'desk', x: 800, y: 1100, w: 80, h: 50, color: 0x374151 },
  { type: 'desk', x: 950, y: 1100, w: 80, h: 50, color: 0x374151 },

  // Collaboration area
  { type: 'table', x: 1550, y: 700, w: 200, h: 100, color: 0x166534, rounded: true },
  { type: 'whiteboard', x: 1850, y: 580, w: 10, h: 120, color: 0xffffff },

  // Lounge sofas
  { type: 'sofa', x: 2200, y: 200, w: 120, h: 60, color: 0x7f1d1d },
  { type: 'sofa', x: 2200, y: 350, w: 120, h: 60, color: 0x7f1d1d },
  { type: 'sofa', x: 2450, y: 200, w: 120, h: 60, color: 0x7f1d1d },
  { type: 'table', x: 2350, y: 280, w: 60, h: 60, color: 0x451a03, rounded: true },

  // Focus pods
  { type: 'pod', x: 2200, y: 800, w: 100, h: 100, color: 0x164e63 },
  { type: 'pod', x: 2400, y: 800, w: 100, h: 100, color: 0x164e63 },
  { type: 'pod', x: 2600, y: 800, w: 100, h: 100, color: 0x164e63 },
  { type: 'pod', x: 2200, y: 1000, w: 100, h: 100, color: 0x164e63 },
  { type: 'pod', x: 2400, y: 1000, w: 100, h: 100, color: 0x164e63 },
  { type: 'pod', x: 2600, y: 1000, w: 100, h: 100, color: 0x164e63 },

  // Kitchen
  { type: 'table', x: 250, y: 1550, w: 140, h: 80, color: 0x713f12, rounded: true },
  { type: 'counter', x: 100, y: 1450, w: 200, h: 20, color: 0x78716c },

  // Game room
  { type: 'table', x: 900, y: 1600, w: 180, h: 100, color: 0x581c87, rounded: true },

  // Plants (decorative)
  { type: 'plant', x: 90, y: 90, w: 24, h: 24, color: 0x22c55e },
  { type: 'plant', x: 900, y: 90, w: 24, h: 24, color: 0x22c55e },
  { type: 'plant', x: 1380, y: 90, w: 24, h: 24, color: 0x22c55e },
  { type: 'plant', x: 2090, y: 90, w: 24, h: 24, color: 0x22c55e },
  { type: 'plant', x: 90, y: 690, w: 24, h: 24, color: 0x22c55e },
  { type: 'plant', x: 1380, y: 540, w: 24, h: 24, color: 0x22c55e },
  { type: 'plant', x: 2090, y: 690, w: 24, h: 24, color: 0x22c55e },
  { type: 'plant', x: 90, y: 1390, w: 24, h: 24, color: 0x22c55e },
  { type: 'plant', x: 690, y: 1390, w: 24, h: 24, color: 0x22c55e },
  { type: 'plant', x: 1390, y: 1090, w: 24, h: 24, color: 0x22c55e },
];

// Chair positions (small circles near desks)
export const CHAIRS = [
  // Main Hall chairs (2 per desk: top and bottom)
  ...Array.from({ length: 16 }, (_, i) => {
    const deskIndex = Math.floor(i / 2);
    const side = i % 2; // 0: top, 1: bottom
    return {
      x: 240 + (deskIndex % 4) * 150,
      y: 200 + Math.floor(deskIndex / 4) * 150 + (side === 0 ? -20 : 70),
      color: 0x4b5563,
    };
  }),
  // Workspace chairs (2 per desk: top and bottom)
  ...Array.from({ length: 36 }, (_, i) => {
    const deskIndex = Math.floor(i / 2);
    const side = i % 2; // 0: top, 1: bottom
    return {
      x: 240 + (deskIndex % 6) * 150,
      y: 800 + Math.floor(deskIndex / 6) * 150 + (side === 0 ? -20 : 70),
      color: 0x4b5563,
    };
  }),
];

// Grid configuration for background pattern
export const GRID = {
  size: 60,
  color: 0xcbd5e1,
  alpha: 0.2,
};
