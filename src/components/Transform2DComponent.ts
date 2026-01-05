interface Vec2 {
  x: number;
  y: number;
}

interface TransformData {
  position?: Partial<Vec2>;
  size?: Partial<Vec2>;
  scale?: Partial<Vec2>;
  anchor?: Partial<Vec2>;
  rotation?: number;
}

export default class Transform2DComponent {
  position: Vec2 | null;
  size: Vec2 | null;
  scale: Vec2 | null;
  anchor: Vec2 | null;
  rotation: number | null;

  /** Initializes transform vectors with provided defaults. */
  constructor(data?: TransformData) {
    this.position = {
      x: data?.position?.x ?? 0,
      y: data?.position?.y ?? 0,
    };
    this.size = {
      x: data?.size?.x ?? 0,
      y: data?.size?.y ?? 0,
    };
    this.scale = {
      x: data?.scale?.x ?? 1,
      y: data?.scale?.y ?? 1,
    };
    this.anchor = {
      x: data?.anchor?.x ?? 1,
      y: data?.anchor?.y ?? 1,
    };
    this.rotation = data?.rotation ?? 0;
  }

  /** Resets transform references to allow GC. */
  destroy(): void {
    this.position = null;
    this.size = null;
    this.scale = null;
    this.anchor = null;
    this.rotation = null;
  }
}