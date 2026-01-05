import Entity from './Entity';
import ComponentFactory from './ComponentFactory';
import EventBus from '../utils/EventBus';
import ComponentType from './ComponentType';
import {Assets} from 'pixi.js';

export default class EntityManager {
    static entities: Map < string, Entity > = new Map();

    /** Builds an entity from asset chunks and emits component events. */
    static async createEntity(assetId: string, entityId: string): Promise < Entity > {
        if(this.getEntity(entityId)){ return;};
        const entity = new Entity(entityId);

        const data = (Assets.get(`${assetId}.json`) ?? {}) as Record < string,
            any > ;

        for (const [type, compData] of Object.entries(data)) {
            const component = ComponentFactory.createComponent(type, compData);
            if (component) entity.addComponent(type, component);
        }

        this.entities.set(entityId, entity);

        for (const type of Object.keys(data)) {
            EventBus.emitAsync(type, entityId);
        }

        return entity;
    }

    /** Tears down an entity and any components that expose destroy. */
    static destroyEntity(entityId: string): void {
        const entity = this.entities.get(entityId);
        if (!entity) return;

        for (const component of entity.getComponents()) {
            if (component && typeof component.destroy === 'function') {
                component.destroy();
            }
        }

        this.entities.delete(entityId);
    }

    /** Returns a managed entity by its identifier. */
    static getEntity(entityId: string): Entity | undefined {
        return this.entities.get(entityId);
    }

    /** Returns the internal map of all entities. */
    static getAllEntities(): Map < string, Entity > {
        return this.entities;
    }

    /** Finds entities that match every requested component type. */
    static queryEntities(requiredComponents: Array < string | number > = []): Entity[] {
        if (requiredComponents.length === 0) {
            return Array.from(this.entities.values());
        }

        return Array.from(this.entities.values()).filter(entity =>
            requiredComponents.every(type => entity.hasComponent(type))
        );
    }

    /** Filters entities belonging to the specified group and components. */
    static queryGroup(groupId: string | number, requiredComponents: Array < string | number > = []): Entity[] {
        return Array.from(this.entities.values()).filter(entity =>
            entity.getComponent(ComponentType.GROUP)?.id === groupId &&
            requiredComponents.every(type => entity.hasComponent(type))
        );
    }
}