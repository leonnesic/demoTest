import BitmapTextComponent from '../components/BitmapTextComponent';
import Camera2DComponent from '../components/Camera2DComponent';
import ContainerComponent from '../components/ContainerComponent';
import GroupComponent from '../components/GroupComponent';
import LayoutComponent from '../components/LayoutComponent';
import Particle2DComponent from '../components/Particle2DComponent';
import SpriteComponent from '../components/SpriteComponent';
import StateComponent from '../components/StateComponent';
import TimerComponent from '../components/TimerComponent';
import Transform2DComponent from '../components/Transform2DComponent';
import Tween2DComponent from '../components/Tween2DComponent';
import UIComponent from '../components/UIComponent';
import Mask2DComponent from '../components/Mask2DComponent';
import Shape2DComponent from '../components/Shape2DComponent';
import DataFetchComponent from '../components/DataFetchComponent';
import ComponentType from './ComponentType';

type ComponentCtor<T = any> = new (data?: any) => T;

const componentMap = new Map<string | number, ComponentCtor>([
  [ComponentType.BITMAPTEXT, BitmapTextComponent],
  [ComponentType.CAMERA2D, Camera2DComponent],
  [ComponentType.CONTAINER, ContainerComponent],
  [ComponentType.GROUP, GroupComponent],
  [ComponentType.LAYOUT, LayoutComponent],
  [ComponentType.PARTICLE2D, Particle2DComponent],
  [ComponentType.SPRITE, SpriteComponent],
  [ComponentType.STATE, StateComponent],
  [ComponentType.TIMER, TimerComponent],
  [ComponentType.TRANSFORM2D, Transform2DComponent],
  [ComponentType.TWEEN2D, Tween2DComponent],
  [ComponentType.UI, UIComponent],
  [ComponentType.MASK2D, Mask2DComponent],
  [ComponentType.SHAPE2D, Shape2DComponent],
  [ComponentType.DATAFETCH, DataFetchComponent],
]);

export default class ComponentFactory {
  /** Instantiates a component class for the provided type key. */
  static createComponent<T = any>(type: string | number, data: any = {}): T | null {
    const Ctor = componentMap.get(type);

    if (!Ctor) {
      console.warn(`[ComponentFactory] Unknown component type: "${String(type)}"`);
      return null;
    }

    try {
      return new Ctor(data) as T;
    } catch (err) {
      console.error(`[ComponentFactory] Failed to create "${String(type)}"`, err);
      return null;
    }
  }

  /** Registers or overrides the constructor tied to a component type. */
  static register(type: string | number, ctor: ComponentCtor): void {
    if (type == null || !ctor) {
      throw new Error('[ComponentFactory] register(type, ctor) requires both args.');
    }
    if (componentMap.has(type)) {
      console.warn(`[ComponentFactory] Overwriting component: ${String(type)}`);
    }
    componentMap.set(type, ctor);
  }

  /** Checks whether a constructor exists for the type. */
  static has(type: string | number): boolean {
    return componentMap.has(type);
  }

  /** Lists the type keys currently registered. */
  static list(): Array<string | number> {
    return Array.from(componentMap.keys());
  }
}