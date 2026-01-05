import ComponentType from '../core/ComponentType';

export interface BitmapTextComponentData {
  fontFamily?: string;
  fontSize?: number;
  align?: string;
  position?: { x: number; y: number };
  text?: string;
  color?: number;
  visible?: boolean;
}

export default class BitmapTextComponent {
  type: string | null;
  fontFamily: string | null;
  fontSize: number | null;
  align: string | null;
  position: { x: number; y: number } | null;
  text: string | null;
  color: number | null;
  visible: boolean | null;
  object2D: any | null;

  /** Initializes bitmap text metadata and defaults. */
  constructor(data: BitmapTextComponentData = {}) {
    this.type = ComponentType.BITMAPTEXT;

    this.fontFamily = data.fontFamily ?? 'defaultFont';
    this.fontSize = data.fontSize ?? 16;
    this.align = data.align ?? 'left';
    this.position = data.position ?? { x: 0, y: 0 };
    this.text = data.text ?? '';
    this.color = data.color ?? 0xffffff;
    this.visible = data.visible ?? true;

    this.object2D = null;
  }

  /** Cleans up linked PIXI object and resets state. */
  destroy(): void {
    if (this.object2D && typeof this.object2D.destroy === 'function') {
      (this.object2D as { destroy: () => void }).destroy();
    }

    this.type = null;
    this.fontFamily = null;
    this.fontSize = null;
    this.align = null;
    this.position = null;
    this.text = null;
    this.color = null;
    this.visible = null;
    this.object2D = null;
  }
}