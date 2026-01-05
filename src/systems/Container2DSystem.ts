import ComponentType from '../core/ComponentType';
import * as PIXI from 'pixi.js';
import GameContext from '../core/GameContext';
import EntityManager from '../core/EntityManager';
import EventBus from '../utils/EventBus';

export default class Container2DSystem {
    static groups: Record < string, PIXI.Container > = {};

    /** Hooks container creation to the EventBus. */
    static init(): void {
        EventBus.on(ComponentType.CONTAINER, (entityId: string) => {
            return Promise.resolve(this.addEntity(entityId));
        });
    }

    /** Creates container groups and wires them to the root. */
    static addEntity(entityId: string): void {
        const entity = EntityManager.getEntity(entityId);
        if (!entity) return;

        const containerComponent = entity.getComponent < {
            container ? : PIXI.Container
        } > (ComponentType.CONTAINER);
        if (!containerComponent) return;

        containerComponent.container = new PIXI.Container();
        containerComponent.container.visible = false;
        containerComponent.container.name = entityId;

        const groupComponent = entity.getComponent < any > (ComponentType.GROUP);
        const groupId = (groupComponent?.getGroupId?.() as string) ?? groupComponent?.id ?? 'default';

        if (!this.groups[groupId]) {
            const group = new PIXI.Container();
            group.visible = false;
            group.name = groupId;
            this.groups[groupId] = group;

            const root = GameContext.get < PIXI.Container > ('root');
            root?.addChild(this.groups[groupId]);
        }

        this.groups[groupId].addChild(containerComponent.container);
    }

    /** Removes an entity container from its group. */
    static removeEntity(entityId: string): void {
        const entity = EntityManager.getEntity(entityId);
        if (!entity) return;

        const containerComponent = entity.getComponent < {
            container ? : PIXI.Container
        } > (ComponentType.CONTAINER);
        if (!containerComponent?.container) return;

        const groupComponent = entity.getComponent < any > (ComponentType.GROUP);
        const groupId = (groupComponent?.getGroupId?.() as string) ?? groupComponent?.id ?? 'default';

        if (this.groups[groupId]) {
            this.groups[groupId].removeChild(containerComponent.container);
        }
    }

    /** Makes the entity container visible. */
    static showContainer(entityId: string): void {
        const entity = EntityManager.getEntity(entityId);
        const container = entity?.getComponent < {
            container ? : PIXI.Container
        } > (ComponentType.CONTAINER)?.container;
        if (container) container.visible = true;
    }

    /** Hides the entity container without deleting it. */
    static hideContainer(entityId: string): void {
        const entity = EntityManager.getEntity(entityId);
        const container = entity?.getComponent < {
            container ? : PIXI.Container
        } > (ComponentType.CONTAINER)?.container;
        if (container) container.visible = false;
    }

    /** Toggles visibility on one or multiple groups to visible. */
    static showGroup(groupIds: string | string[]): void {
        const ids = Array.isArray(groupIds) ? groupIds : [groupIds];
        ids.forEach(id => {
            const group = this.groups[id];
            if (group) group.visible = true;
        });
    }

    /** Hides one or multiple groups from rendering. */
    static hideGroup(groupIds: string | string[]): void {
        const ids = Array.isArray(groupIds) ? groupIds : [groupIds];
        ids.forEach(id => {
            const group = this.groups[id];
            if (group) group.visible = false;
        });
    }

    /** Destroys a group when it is empty to release resources. */
    static destroyGroup(groupId: string): void {
        const group = this.groups[groupId];
        if (group && group.children.length === 0) {
            const root = GameContext.get < PIXI.Container > ('root');
            root?.removeChild(group);
            group.destroy({
                children: true,
                texture: true,
                baseTexture: true
            });
            delete this.groups[groupId];
        }
    }

    /** Removes all groups and clears their references. */
    static destroy(): void {
        for (const groupId of Object.keys(this.groups)) {
            const group = this.groups[groupId];
            const root = GameContext.get < PIXI.Container > ('root');
            root?.removeChild(group);
            group.destroy({
                children: true,
                texture: true,
                baseTexture: true
            });
            delete this.groups[groupId];
        }
        this.groups = {};
    }
}