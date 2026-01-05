import * as PIXI from 'pixi.js';
import EntityManager from '../core/EntityManager';
import ComponentType from '../core/ComponentType';

export interface Mask2DComponent {
  shape?: 'rect' | 'circle';
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  radius?: number;
}

export default class Mask2DSystem {
  /** Applies a PIXI mask shape to the entity’s container. */
  static setMask(entityId: string): void {
    const entity = EntityManager.getEntity(entityId);
    if (!entity) return;

    const containerComp = entity.getComponent<{ container?: PIXI.Container }>(ComponentType.CONTAINER);
    const maskComp = entity.getComponent<Mask2DComponent>(ComponentType.MASK2D);
    if (!containerComp?.container || !maskComp) return;

    const existing = containerComp.container.mask as PIXI.DisplayObject | null | undefined;
    if (existing && existing instanceof PIXI.Graphics) {
      containerComp.container.removeChild(existing);
      try {
        existing.destroy({ children: true });
      } catch {
      }
    }

    const mask = new PIXI.Graphics();
    mask.beginFill(0xffffff);
    mask.position.set(maskComp.x ?? 0, maskComp.y ?? 0);

    if (maskComp.shape === 'rect') {
      mask.drawRect(0, 0, maskComp.width ?? 0, maskComp.height ?? 0);
    } else if (maskComp.shape === 'circle') {
      mask.drawCircle(0, 0, maskComp.radius ?? 0);
    }

    mask.endFill();

    containerComp.container.addChild(mask);
    containerComp.container.mask = mask;
  }

  /** Removes and destroys the mask graphic for the entity. */
  static destroy(entityId: string): void {
    const entity = EntityManager.getEntity(entityId);
    if (!entity) return;

    const containerComp = entity.getComponent<{ container?: PIXI.Container }>(ComponentType.CONTAINER);
    if (!containerComp?.container) return;

    const mask = containerComp.container.mask as PIXI.Graphics | null | undefined;
    if (!mask) return;

    if (mask instanceof PIXI.Graphics) {
      containerComp.container.removeChild(mask);
      try {
        mask.destroy({ children: true });
      } catch {
      }
    }

    containerComp.container.mask = null;
  }
}