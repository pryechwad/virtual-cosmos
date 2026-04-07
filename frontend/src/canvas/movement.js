// movement.js — Keyboard input, position update, and throttled socket emission

const SPEED = 3.5;
const EMIT_INTERVAL = 66; // ~15fps socket updates

export class MovementController {
  constructor(socket) {
    this.socket = socket;
    this.keys = { up: false, down: false, left: false, right: false };
    this.x = 0;
    this.y = 0;
    this.isMoving = false;
    this._lastEmit = 0;
    this._boundKeyDown = this._onKeyDown.bind(this);
    this._boundKeyUp = this._onKeyUp.bind(this);

    window.addEventListener('keydown', this._boundKeyDown);
    window.addEventListener('keyup', this._boundKeyUp);
  }

  _onKeyDown(e) {
    switch (e.code) {
      case 'KeyW': case 'ArrowUp':    this.keys.up = true; break;
      case 'KeyS': case 'ArrowDown':  this.keys.down = true; break;
      case 'KeyA': case 'ArrowLeft':  this.keys.left = true; break;
      case 'KeyD': case 'ArrowRight': this.keys.right = true; break;
    }
  }

  _onKeyUp(e) {
    switch (e.code) {
      case 'KeyW': case 'ArrowUp':    this.keys.up = false; break;
      case 'KeyS': case 'ArrowDown':  this.keys.down = false; break;
      case 'KeyA': case 'ArrowLeft':  this.keys.left = false; break;
      case 'KeyD': case 'ArrowRight': this.keys.right = false; break;
    }
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
  }

  update(delta, worldWidth, worldHeight) {
    let dx = 0;
    let dy = 0;

    if (this.keys.up)    dy -= 1;
    if (this.keys.down)  dy += 1;
    if (this.keys.left)  dx -= 1;
    if (this.keys.right) dx += 1;

    // Normalize diagonal movement
    if (dx !== 0 && dy !== 0) {
      const len = Math.sqrt(dx * dx + dy * dy);
      dx /= len;
      dy /= len;
    }

    this.isMoving = dx !== 0 || dy !== 0;

    if (this.isMoving) {
      const speed = SPEED * delta;
      this.x = Math.max(40, Math.min(worldWidth - 40, this.x + dx * speed));
      this.y = Math.max(40, Math.min(worldHeight - 40, this.y + dy * speed));

      // Throttled emit
      const now = Date.now();
      if (now - this._lastEmit > EMIT_INTERVAL) {
        this.socket.emit('move', { x: this.x, y: this.y });
        this._lastEmit = now;
      }
    }

    return { x: this.x, y: this.y, isMoving: this.isMoving };
  }

  destroy() {
    window.removeEventListener('keydown', this._boundKeyDown);
    window.removeEventListener('keyup', this._boundKeyUp);
  }
}
