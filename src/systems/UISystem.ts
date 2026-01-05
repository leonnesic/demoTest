import * as PIXI from 'pixi.js';
import ComponentType from '../core/ComponentType';
import EventBus from '../utils/EventBus';
import EntityManager from '../core/EntityManager';
import type Entity from '../core/Entity';

interface UIEventDef {
  action: string;
  params?: any;
}

interface UIComponent {
  interactive?: boolean;
  cursor?: string;
  events?: Record<string, UIEventDef>;
  keyBindings?: string[];
  customData?: any;
}

interface ContainerComponent {
  container?: PIXI.Container | null;
}

export default class UISystem {
  static focusedEntity: Entity | null = null;
  static _keyHandler: ((e: KeyboardEvent) => void) | null = null;

  /** Hooks up UI event listeners and keyboard handling. */
  static init(): void {
    this._keyHandler = this.handleKeyDown.bind(this);
    window.addEventListener('keydown', this._keyHandler);

    EventBus.on(ComponentType.UI, (entityId: string) => {
      this.addEntity(entityId);
    });
  }

  /** Removes listeners and clears focus for UI teardown. */
  static destroy(): void {
    if (this._keyHandler) {
      window.removeEventListener('keydown', this._keyHandler);
      this._keyHandler = null;
    }

    const uiEntities = EntityManager.query([ComponentType.UI, ComponentType.CONTAINER]) as Entity[];
    for (const entity of uiEntities) {
      this.removeEntity(entity);
    }

    this.clearFocus();
    console.debug('[UISystem] Destroyed');
  }

  /** Sets up PIXI interactivity and emits UI events. */
  static addEntity(entityId: string): void {
    const entity = EntityManager.getEntity(entityId);
    const ui = entity?.getComponent<UIComponent>(ComponentType.UI);
    const container = entity?.getComponent<ContainerComponent>(ComponentType.CONTAINER)?.container;
    if (!ui || !container) return;

    if (ui.interactive) {
      container.interactive = true;
      if (ui.cursor) container.cursor = ui.cursor;
    }

    for (const [evt, def] of Object.entries(ui.events ?? {})) {
      const pixiEvt = evt.toLowerCase();
      container.on(pixiEvt as any, (e: any) => {
        EventBus.emitAsync(`ui:${evt}`, {
          entityId,
          originalEvent: e,
          action: def.action,
          params: def.params,
          customData: ui.customData,
        });

        this.executeAction(entity, def, e);

        if (evt === 'pointerDown') this.focusEntity(entity);
      });
    }
  }

  /** Removes event listeners and focus tracking for the entity. */
  static removeEntity(entity: Entity): void {
    const container = entity.getComponent<ContainerComponent>(ComponentType.CONTAINER)?.container;
    if (container) container.removeAllListeners();

    if (this.focusedEntity?.name === entity.name) {
      this.clearFocus();
    }
  }

  /** Routes keyboard events to focused UI entities. */
  static handleKeyDown(e: KeyboardEvent): void {
    const entity = this.focusedEntity;
    if (!entity) return;

    const ui = entity.getComponent<UIComponent>(ComponentType.UI);
    if (!ui || !ui.keyBindings?.includes(e.key)) return;

    EventBus.emit('ui:keyDown', {
      entityId: entity.name,
      event: e,
      customData: ui.customData,
    });

    const action = ui.events?.keyDown;
    if (action) this.executeAction(entity, action, e);
  }

  /** Emits uiAction events and dispatches to target entities. */
  static executeAction(sourceEntity: Entity, eventData: { action: string; target?: string; params?: any }, inputEvent?: Event): void {
    const { action, target = 'self', params = {} } = eventData;
    const targetEntity = target === 'self' ? sourceEntity : EntityManager.getEntity(target);
    if (!targetEntity) return;

    EventBus.emitAsync(`uiAction:${action}`, {
      source: sourceEntity.name,
      target: targetEntity.name,
      params,
      inputEvent,
    });
  }

  /** Sets the current focused entity for keyboard events. */
  static focusEntity(entity: Entity): void {
    if (this.focusedEntity === entity) return;

    if (this.focusedEntity) {
      EventBus.emit('ui:blur', {
        entityId: this.focusedEntity.name,
      });
    }

    this.focusedEntity = entity;

    EventBus.emit('ui:focus', {
      entityId: entity.name,
    });
  }

  /** Clears UI focus and emits blur if needed. */
  static clearFocus(): void {
    if (this.focusedEntity) {
      EventBus.emit('ui:blur', {
        entityId: this.focusedEntity.name,
      });
    }
    this.focusedEntity = null;
  }

  /** Disables pointer events on all UI containers. */
  static disable(): void {
    const entities = EntityManager.query([ComponentType.UI, ComponentType.CONTAINER]) as Entity[];
    for (const entity of entities) {
      const container = entity.getComponent<ContainerComponent>(ComponentType.CONTAINER)?.container;
      if (container) container.eventMode = 'none';
    }
  }

  /** Re-enables pointer events respecting interactivity flags. */
  static enable(): void {
    const entities = EntityManager.query([ComponentType.UI, ComponentType.CONTAINER]) as Entity[];
    for (const entity of entities) {
      const ui = entity.getComponent<UIComponent>(ComponentType.UI);
      const container = entity.getComponent<ContainerComponent>(ComponentType.CONTAINER)?.container;
      if (ui && container) {
        container.eventMode = ui.interactive ? 'static' : 'none';
      }
    }
  }

  /** Registers a handler for UI EventBus channels. */
  static on(type: string, handler: (...args: any[]) => void): void {
    EventBus.on(`ui:${type}`, handler);
  }

  /** Removes a handler from the UI event channel. */
  static off(type: string, handler: (...args: any[]) => void): void {
    EventBus.off(`ui:${type}`, handler);
  }

  /** Returns a promise resolving on the next ui:<type> event. */
  static waitFor<T = any>(type: string): Promise<T> {
    return new Promise((resolve) => {
      const fn = (data: T) => {
        EventBus.off(`ui:${type}`, fn);
        resolve(data);
      };
      EventBus.on(`ui:${type}`, fn);
    });
  }
}