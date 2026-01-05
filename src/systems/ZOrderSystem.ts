import ComponentType from '../core/ComponentType';
import EntityManager from '../core/EntityManager';
import Container2DSystem from './Container2DSystem';
import GameContext from '../core/GameContext';
import * as PIXI from 'pixi.js';

export default class ZOrderSystem {
  /** Moves the entity’s container to the top of its group stack. */
  static moveEntityToTop(entityId: string): void {
    const { container, group } = this.getEntityRefs(entityId);
    if (!container || !group) return;
    group.setChildIndex(container, group.children.length - 1);
  }

  /** Sends the entity container to the bottom of its group. */
  static moveEntityToBottom(entityId: string): void {
    const { container, group } = this.getEntityRefs(entityId);
    if (!container || !group) return;
    group.setChildIndex(container, 0);
  }

  /** Reorders the entity container to the requested index. */
  static moveEntityToPosition(entityId: string, index: number): void {
    const { container, group } = this.getEntityRefs(entityId);
    if (!container || !group) return;
    const clampedIndex = Math.max(0, Math.min(index, group.children.length - 1));
    group.setChildIndex(container, clampedIndex);
  }

  /** Positions the entity directly above another entity. */
  static moveEntityAbove(entityId: string, targetEntityId: string): void {
    const { container, group } = this.getEntityRefs(entityId);
    const { container: targetContainer } = this.getEntityRefs(targetEntityId);
    if (!container || !group || !targetContainer) return;
    const targetIndex = group.getChildIndex(targetContainer);
    group.setChildIndex(container, targetIndex + 1);
  }

  /** Positions the entity just below a target entity. */
  static moveEntityBelow(entityId: string, targetEntityId: string): void {
    const { container, group } = this.getEntityRefs(entityId);
    const { container: targetContainer } = this.getEntityRefs(targetEntityId);
    if (!container || !group || !targetContainer) return;
    const targetIndex = group.getChildIndex(targetContainer);
    group.setChildIndex(container, Math.max(0, targetIndex - 1));
  }

  /** Raises an entire group to the top of the stage. */
  static moveGroupToTop(groupId: string): void {
    const root = GameContext.get('root') as PIXI.Container | undefined;
    const group = Container2DSystem.groups[groupId] as PIXI.Container | undefined;
    if (!root || !group) return;
    root.setChildIndex(group, root.children.length - 1);
  }

  /** Sends a group container to the stage bottom layer. */
  static moveGroupToBottom(groupId: string): void {
    const root = GameContext.get('root') as PIXI.Container | undefined;
    const group = Container2DSystem.groups[groupId] as PIXI.Container | undefined;
    if (!root || !group) return;
    root.setChildIndex(group, 0);
  }

  /** Sets group layering to the specified index. */
  static moveGroupToPosition(groupId: string, index: number): void {
    const root = GameContext.get('root') as PIXI.Container | undefined;
    const group = Container2DSystem.groups[groupId] as PIXI.Container | undefined;
    if (!root || !group) return;
    const clampedIndex = Math.max(0, Math.min(index, root.children.length - 1));
    root.setChildIndex(group, clampedIndex);
  }

  /** Moves a group immediately above another group. */
  static moveGroupAbove(groupId: string, targetGroupId: string): void {
    const root = GameContext.get('root') as PIXI.Container | undefined;
    const group = Container2DSystem.groups[groupId] as PIXI.Container | undefined;
    const targetGroup = Container2DSystem.groups[targetGroupId] as PIXI.Container | undefined;
    if (!root || !group || !targetGroup) return;
    const targetIndex = root.getChildIndex(targetGroup);
    root.setChildIndex(group, targetIndex + 1);
  }

  /** Moves a group immediately below another group. */
  static moveGroupBelow(groupId: string, targetGroupId: string): void {
    const root = GameContext.get('root') as PIXI.Container | undefined;
    const group = Container2DSystem.groups[groupId] as PIXI.Container | undefined;
    const targetGroup = Container2DSystem.groups[targetGroupId] as PIXI.Container | undefined;
    if (!root || !group || !targetGroup) return;
    const targetIndex = root.getChildIndex(targetGroup);
    root.setChildIndex(group, Math.max(0, targetIndex - 1));
  }

  /** Retrieves the PIXI container and group for an entity. */
  static getEntityRefs(entityId: string): { container?: PIXI.Container | null; group?: PIXI.Container | null } {
    const entity = EntityManager.getEntity(entityId);
    if (!entity) return {};

    const containerComponent = entity.getComponent(ComponentType.CONTAINER) as { container?: PIXI.Container | null } | undefined;
    if (!containerComponent) return {};

    const groupId = entity.getComponent(ComponentType.GROUP)?.id ?? 'default';
    const group = Container2DSystem.groups[groupId] as PIXI.Container | undefined;

    return {
      container: containerComponent.container ?? null,
      group: group ?? null,
    };
  }
}