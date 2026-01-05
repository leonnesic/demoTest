import * as PIXI from 'pixi.js';

export interface Vec2 { x: number; y: number; }

export interface Shape2DComponentData {
  shape?: 'rect' | 'circle' | 'ellipse' | 'polygon' | string;
  position?: Vec2;
  size?: Vec2;
  scale?: Vec2;
  pivot?: Vec2;
  radius?: number;
  color?: number;
  gradient?: any | null;
  alpha?: number;
  strokeColor?: number;
  strokeWidth?: number;
  visible?: boolean;
}

export default class Shape2DComponent {
  shape: string | null;
  position: Vec2 | null;
  size: Vec2 | null;
  scale: Vec2 | null;
  pivot: Vec2 | null;
  radius: number | null;
  color: number | null;
  gradient: any | null;
  alpha: number | null;
  strokeColor: number | null;
  strokeWidth: number | null;
  visible: boolean | null;

  graphics: PIXI.Graphics | null;

  /** Configures shape defaults for rendering. */
  constructor({
    shape = 'rect',
    position = { x: 0, y: 0 },
    size = { x: 0, y: 0 },
    scale = { x: 1, y: 1 },
    pivot = { x: 0, y: 0 },
    radius = 0,
    color = 0xffffff,
    gradient = null,
    alpha = 1,
    strokeColor = 0x000000,
    strokeWidth = 0,
    visible = true,
  }: Shape2DComponentData = {}) {
    this.shape = shape;
    this.position = position;
    this.size = size;
    this.scale = scale;
    this.pivot = pivot;
    this.radius = radius;

    this.color = color;
    this.gradient = gradient;
    this.alpha = alpha;

    this.strokeColor = strokeColor;
    this.strokeWidth = strokeWidth;

    this.visible = visible;

    this.graphics = null;
  }

  /** Removes cached graphics and resets shape fields. */
  destroy(): void {
    if (this.graphics) {
      if (this.graphics.parent) {
        this.graphics.parent.removeChild(this.graphics);
      }
      this.graphics.destroy(true);
    }

    this.graphics = null;

    this.position = null;
    this.size = null;
    this.scale = null;
    this.pivot = null;
    this.gradient = null;

    this.shape = null;
    this.radius = null;
    this.color = null;
    this.alpha = null;

    this.strokeColor = null;
    this.strokeWidth = null;
    this.visible = null;
  }
}