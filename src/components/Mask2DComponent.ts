export interface Mask2DComponentData {
  shape?: 'rect' | 'circle' | string;
  width?: number;
  height?: number;
  radius?: number;
  active?: boolean;
}

export default class Mask2DComponent {
  shape: string | null;
  width: number | null;
  height: number | null;
  radius: number | null;
  active: boolean | null;

  /** Sets mask parameters such as shape, size, and activity. */
  constructor({
    shape = 'rect',
    width = 100,
    height = 100,
    radius = 50,
    active = true,
  }: Mask2DComponentData = {}) {
    this.shape = shape;
    this.width = width;
    this.height = height;
    this.radius = radius;
    this.active = active;
  }

  /** Resets mask values to allow cleanup. */
  destroy(): void {
    this.shape = null;
    this.width = null;
    this.height = null;
    this.radius = null;
    this.active = null;
  }
}