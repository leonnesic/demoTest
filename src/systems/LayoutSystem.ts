import ComponentType from '../core/ComponentType';
import GameContext from '../core/GameContext';
import EntityManager from '../core/EntityManager';
import EventBus from '../utils/EventBus';
import type Entity from '../core/Entity';

type AnchorX = 'left' | 'center' | 'right';
type AnchorY = 'top' | 'center' | 'bottom';

interface LayoutComponent {
  anchorX?: AnchorX;
  anchorY?: AnchorY;
  offsetX?: number;
  offsetY?: number;
}

interface Transform2D {
  position: { x: number; y: number };
}

export default class LayoutSystem {
  private static boundApply?: () => void;

  /** Hooks resize events to recalculate anchor layout. */
  static init(): void {
    this.boundApply = this.applyLayout.bind(this);
    EventBus.on('stageResized', this.boundApply);
  }


  /** Recomputes positioned transforms using anchor offsets. */
  static applyLayout(): void {
    const stageWidth = (GameContext.get<number>('BASE_WIDTH') ?? 0);
    const stageHeight = (GameContext.get<number>('BASE_HEIGHT') ?? 0);
    const halfW = stageWidth / 2;
    const halfH = stageHeight / 2;

    const entities = EntityManager.queryEntities([
      ComponentType.LAYOUT,
      ComponentType.TRANSFORM2D,
    ]) as Entity[];

    for (const entity of entities) {
      const layout = entity.getComponent<LayoutComponent>(ComponentType.LAYOUT);
      const transform = entity.getComponent<Transform2D>(ComponentType.TRANSFORM2D);

      if (!layout || !transform) continue;

      const anchorX = layout.anchorX ?? 'center';
      const anchorY = layout.anchorY ?? 'center';

      let x = 0;
      let y = 0;

      switch (anchorX) {
        case 'left':
          x = -halfW;
          break;
        case 'right':
          x = halfW;
          break;
        case 'center':
        default:
          x = 0;
          break;
      }

      switch (anchorY) {
        case 'top':
          y = halfH;
          break;
        case 'bottom':
          y = -halfH;
          break;
        case 'center':
        default:
          y = 0;
          break;
      }

      transform.position.x = x + (layout.offsetX ?? 0);
      transform.position.y = y + (layout.offsetY ?? 0);
    }
  }

  /** Removes resize listener and resets dirty flag. */
  static destroy(): void {
    if (this.boundApply) {
      EventBus.off('stageResized', this.boundApply);
      this.boundApply = undefined;
    }
    GameContext.set('layoutDirty', false);
  }
}