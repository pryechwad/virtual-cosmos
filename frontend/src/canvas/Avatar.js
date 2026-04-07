// Avatar.js — PixiJS avatar rendering with shadow, glow, name label, and animations
import * as PIXI from 'pixi.js';

const AVATAR_SIZE = 48;
const SHADOW_OFFSET = 4;
const GLOW_RADIUS = 60;

export class Avatar {
  constructor({ id, username, avatarUrl, x, y, isLocal = false }) {
    this.id = id;
    this.username = username;
    this.avatarUrl = avatarUrl;
    this.isLocal = isLocal;
    this.targetX = x;
    this.targetY = y;
    this.isMoving = false;
    this.isConnected = false;
    this.isNearby = false;
    this._bouncePhase = 0;

    // Root container
    this.container = new PIXI.Container();
    this.container.x = x;
    this.container.y = y;
    this.container.sortableChildren = true;
    if (this.isLocal) {
      this.container.scale.set(1.75); // Made local avatar EVEN bigger
    }

    this._createShadow();
    this._createGlowRing();
    this._createProximityRadius();
    this._createAvatarSprite();
    this._createNameLabel();
    this._createStatusIndicator();
  }

  _createShadow() {
    this.shadow = new PIXI.Graphics();
    this.shadow.beginFill(0x000000, 0.35);
    this.shadow.drawEllipse(0, SHADOW_OFFSET + 4, AVATAR_SIZE / 2 + 4, 10);
    this.shadow.endFill();
    this.shadow.zIndex = 0;
    this.container.addChild(this.shadow);
  }

  _createGlowRing() {
    this.glowRing = new PIXI.Graphics();
    this.glowRing.zIndex = 1;
    this._drawGlowRing(0x6366f1, 0);
    this.container.addChild(this.glowRing);
  }

  _drawGlowRing(color, alpha) {
    this.glowRing.clear();
    // Outer glow
    this.glowRing.beginFill(color, alpha * 0.15);
    this.glowRing.drawCircle(0, 0, AVATAR_SIZE / 2 + 14);
    this.glowRing.endFill();
    // Inner ring
    this.glowRing.lineStyle(2, color, alpha * 0.8);
    this.glowRing.drawCircle(0, 0, AVATAR_SIZE / 2 + 6);
  }

  _createProximityRadius() {
    this.proximityCircle = new PIXI.Graphics();
    this.proximityCircle.zIndex = -1;
    this.proximityCircle.alpha = 0;
    this.container.addChild(this.proximityCircle);

    if (this.isLocal) {
      this._drawProximityRadius();
    }
  }

  _drawProximityRadius() {
    this.proximityCircle.clear();
    // Soft radial proximity glow for local player
    const radius = 150;
    for (let i = 5; i > 0; i--) {
      const r = radius * (i / 5);
      const a = 0.03 * (6 - i);
      this.proximityCircle.beginFill(0x6366f1, a);
      this.proximityCircle.drawCircle(0, 0, r);
      this.proximityCircle.endFill();
    }
    this.proximityCircle.alpha = this.isLocal ? 0.6 : 0;
  }

  _createAvatarSprite() {
    // Create a circular avatar using a colored circle as base, then overlay with image
    this.avatarContainer = new PIXI.Container();
    this.avatarContainer.zIndex = 2;

    // Background circle
    this.avatarBg = new PIXI.Graphics();
    this.avatarBg.beginFill(0x374151);
    this.avatarBg.drawCircle(0, 0, AVATAR_SIZE / 2);
    this.avatarBg.endFill();
    this.avatarContainer.addChild(this.avatarBg);

    // Border
    this.avatarBorder = new PIXI.Graphics();
    this.avatarBorder.lineStyle(3, this.isLocal ? 0x6366f1 : 0x475569, 1);
    this.avatarBorder.drawCircle(0, 0, AVATAR_SIZE / 2 + 1);
    this.avatarContainer.addChild(this.avatarBorder);

    // Initial letter fallback
    const initial = new PIXI.Text(this.username.charAt(0).toUpperCase(), {
      fontFamily: 'Inter, sans-serif',
      fontSize: 22,
      fontWeight: '700',
      fill: 0xe2e8f0,
      align: 'center',
    });
    initial.anchor.set(0.5);
    this.avatarContainer.addChild(initial);
    this.initialText = initial;

    // Load avatar image
    this._loadAvatarImage();

    this.container.addChild(this.avatarContainer);
  }

  async _loadAvatarImage() {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = this.avatarUrl;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });
      
      const texture = PIXI.Texture.from(img);
      const sprite = new PIXI.Sprite(texture);
      sprite.anchor.set(0.5);
      sprite.width = AVATAR_SIZE;
      sprite.height = AVATAR_SIZE;

      // Circular mask
      const mask = new PIXI.Graphics();
      mask.beginFill(0xffffff);
      mask.drawCircle(0, 0, AVATAR_SIZE / 2);
      mask.endFill();
      this.avatarContainer.addChild(mask);
      sprite.mask = mask;

      this.avatarContainer.addChildAt(sprite, 1); // After bg, before border
      if (this.initialText) {
        this.initialText.visible = false;
      }
      this.avatarSprite = sprite;
    } catch (e) {
      // Keep initial letter if image fails to load
      console.warn(`Avatar load failed for ${this.username}:`, e);
    }
  }

  _createNameLabel() {
    this.nameLabel = new PIXI.Text(this.username, {
      fontFamily: 'Inter, sans-serif',
      fontSize: 12,
      fontWeight: '600',
      fill: 0xe2e8f0,
      align: 'center',
      dropShadow: true,
      dropShadowAlpha: 0.6,
      dropShadowBlur: 4,
      dropShadowColor: 0x000000,
      dropShadowDistance: 0,
    });
    this.nameLabel.anchor.set(0.5);
    this.nameLabel.y = -(AVATAR_SIZE / 2 + 16);
    this.nameLabel.zIndex = 3;
    this.container.addChild(this.nameLabel);

    // Name background pill
    const padding = 8;
    const bg = new PIXI.Graphics();
    bg.beginFill(0x0f172a, 0.75);
    bg.drawRoundedRect(
      -this.nameLabel.width / 2 - padding,
      -(AVATAR_SIZE / 2 + 16) - this.nameLabel.height / 2 - 3,
      this.nameLabel.width + padding * 2,
      this.nameLabel.height + 6,
      8
    );
    bg.endFill();
    bg.zIndex = 2;
    this.container.addChild(bg);
    this.nameBg = bg;
  }

  _createStatusIndicator() {
    this.statusDot = new PIXI.Graphics();
    this.statusDot.beginFill(0x10b981);
    this.statusDot.drawCircle(AVATAR_SIZE / 2 - 4, AVATAR_SIZE / 2 - 4, 6);
    this.statusDot.endFill();
    // White border
    this.statusDot.lineStyle(2, 0x0f172a, 1);
    this.statusDot.drawCircle(AVATAR_SIZE / 2 - 4, AVATAR_SIZE / 2 - 4, 6);
    this.statusDot.zIndex = 4;
    this.container.addChild(this.statusDot);
  }

  setConnected(connected) {
    if (this.isConnected === connected) return;
    this.isConnected = connected;
    this._updateGlow();
  }

  setNearby(nearby) {
    if (this.isNearby === nearby) return;
    this.isNearby = nearby;
    this._updateGlow();
  }

  _updateGlow() {
    if (this.isConnected) {
      this._drawGlowRing(0x6366f1, 1);
      this.avatarBorder.clear();
      this.avatarBorder.lineStyle(3, 0x6366f1, 1);
      this.avatarBorder.drawCircle(0, 0, AVATAR_SIZE / 2 + 1);
    } else if (this.isNearby) {
      this._drawGlowRing(0xf59e0b, 0.6);
      this.avatarBorder.clear();
      this.avatarBorder.lineStyle(3, 0xf59e0b, 0.8);
      this.avatarBorder.drawCircle(0, 0, AVATAR_SIZE / 2 + 1);
    } else {
      this._drawGlowRing(0x6366f1, 0);
      this.avatarBorder.clear();
      this.avatarBorder.lineStyle(3, this.isLocal ? 0x6366f1 : 0x475569, 1);
      this.avatarBorder.drawCircle(0, 0, AVATAR_SIZE / 2 + 1);
    }
  }

  update(delta) {
    // Lerp toward target for remote avatars
    if (!this.isLocal) {
      const lerpFactor = 0.12;
      this.container.x += (this.targetX - this.container.x) * lerpFactor;
      this.container.y += (this.targetY - this.container.y) * lerpFactor;
    }

    // Bounce animation while moving
    if (this.isMoving) {
      this._bouncePhase += delta * 0.15;
      const bounceY = Math.sin(this._bouncePhase) * 3;
      this.avatarContainer.y = bounceY;
      // Slight scale pulse
      const scale = 1 + Math.sin(this._bouncePhase * 0.5) * 0.03;
      this.avatarContainer.scale.set(scale);
    } else {
      this._bouncePhase = 0;
      this.avatarContainer.y += (0 - this.avatarContainer.y) * 0.1;
      this.avatarContainer.scale.x += (1 - this.avatarContainer.scale.x) * 0.1;
      this.avatarContainer.scale.y += (1 - this.avatarContainer.scale.y) * 0.1;
    }

    // Glow ring pulse when connected
    if (this.isConnected) {
      const pulse = 0.6 + Math.sin(Date.now() * 0.003) * 0.4;
      this.glowRing.alpha = pulse;
    } else if (this.isNearby) {
      this.glowRing.alpha = 0.5;
    } else {
      this.glowRing.alpha += (0 - this.glowRing.alpha) * 0.05;
    }
  }

  setPosition(x, y) {
    if (this.isLocal) {
      this.container.x = x;
      this.container.y = y;
    }
    this.targetX = x;
    this.targetY = y;
  }

  destroy() {
    this.container.destroy({ children: true });
  }
}
