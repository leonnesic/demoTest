import * as PIXI from 'pixi.js';

export interface ContainerComponentData {
  container?: PIXI.Container | null;
}

export default class ContainerComponent {
  container: PIXI.Container | null;

  /** Wraps a PIXI.Container reference for the entity. */
  constructor(payload: ContainerComponentData = {}) {
    this.container = payload.container ?? null;
  }

  /** Tears down the container if it exists. */
  destroy(): void {
    if (this.container) {
      this.container.destroy({ children: true, texture: false });
      this.container = null;
    }
  }
}