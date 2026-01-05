import * as PIXI from 'pixi.js';

export interface Vec2 {
  x: number;
  y: number;
}

export interface AnimationDefinition {
  frames: string[];
  position?: Vec2;
  anchor?: Vec2;
  speed?: number;
  loop?: boolean;
}

export interface SpriteComponentData {
  animations?: Record<string, AnimationDefinition>;
  container?: PIXI.Container | null;
}

export default class SpriteComponent {
  animations: Record<string, AnimationDefinition>;
  sprites: Record<string, PIXI.AnimatedSprite | PIXI.Sprite | null>;
  container: PIXI.Container | null;

  /** Initializes animation definitions and sprite containers. */
  constructor(componentData: SpriteComponentData = {}) {
    this.animations = componentData.animations ?? {};
    this.sprites = {};
    this.container = componentData.container ?? null;
  }

  /** Clears sprite references for cleanup. */
  destroy(): void {
    this.animations = {};
    this.sprites = {};
    this.container = null;
  }
}
