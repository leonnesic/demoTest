interface Vec2 {
  x: number;
  y: number;
}

interface TweenConfig {
  type?: string;
  target?: unknown;
  duration?: number;
  delay?: number;
  ease?: string;
  repeat?: number;
  path?: Vec2[];
  props?: Record<string, unknown>;
  from?: Record<string, unknown>;
  range?: Record<string, unknown>;
  axis?: string;
  speed?: number;
  strength?: number;
}

interface NormalizedTween {
  type: string;
  target: unknown;
  duration: number;
  delay: number;
  ease: string;
  repeat: number;
  path: Vec2[];
  props?: Record<string, unknown>;
  from?: Record<string, unknown>;
  range?: Record<string, unknown>;
  axis?: string;
  speed?: number;
  strength?: number;
}

export default class Tween2DComponent {
  private tweens: Record<string, NormalizedTween> | null;
  private defaults: Required<Omit<TweenConfig, 'props' | 'from' | 'range' | 'axis' | 'speed' | 'strength'>>;

  /** Normalizes provided tween definitions and applies defaults. */
  constructor(data: { tweens?: Record<string, TweenConfig> } = {}) {
    this.tweens = {};
    this.defaults = {
      duration: 1,
      ease: 'linear',
      repeat: 0,
      delay: 0,
      path: [
        { x: 0, y: 0 },
        { x: 10, y: 11 },
      ],
    };

    if (data.tweens) {
      this.addTweens(data.tweens);
    }
  }

  /** Adds a single normalized tween entry. */
  addTween(name: string, config: TweenConfig): void {
    if (!this.tweens) return;
    this.tweens[name] = this.normalize(config);
  }

  /** Adds multiple tweens from a dictionary. */
  addTweens(tweens: Record<string, TweenConfig>): void {
    for (const [name, config] of Object.entries(tweens)) {
      this.addTween(name, config);
    }
  }

  /** Removes a named tween definition. */
  removeTween(name: string): void {
    if (!this.tweens) return;
    delete this.tweens[name];
  }

  /** Retrieves normalized tween data by name. */
  getTween(name: string): NormalizedTween | null {
    return this.tweens ? this.tweens[name] ?? null : null;
  }

  /** Fills missing tween options as part of normalization. */
  private normalize(config: TweenConfig): NormalizedTween {
    const out: NormalizedTween = {
      type: config.type || 'to',
      target: config.target || null,
      duration: config.duration ?? this.defaults.duration,
      delay: config.delay ?? this.defaults.delay,
      ease: config.ease || this.defaults.ease,
      repeat: config.repeat ?? this.defaults.repeat,
      path: config.path ?? this.defaults.path,
    };

    if (config.props) out.props = structuredClone(config.props);
    if (config.from) out.from = structuredClone(config.from);
    if (config.range) out.range = structuredClone(config.range);
    if (config.axis) out.axis = config.axis;
    if (config.speed) out.speed = config.speed;
    if (config.strength) out.strength = config.strength;

    return out;
  }

  /** Clears all stored tween definitions. */
  destroy(): void {
    this.tweens = null;
  }
}