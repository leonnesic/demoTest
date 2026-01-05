import * as PIXI from 'pixi.js';
import ComponentType from '../core/ComponentType';
import GameContext from '../core/GameContext';
import EntityManager from '../core/EntityManager';

const {
    CONTAINER,
    TRANSFORM2D
} = ComponentType;

interface Vec2 {
    x: number;
    y: number;
}

interface Transform2DComponent {
    position: Vec2;
    size ? : Vec2;
    anchor ? : Vec2;
    rotation ? : number;
    scale ? : Vec2;
}

interface ContainerComponent {
    container ? : PIXI.Container | null;
}

export default class Transform2DSystem {
    /** Sets the transform position and syncs containers. */
    static async setPosition(entityId: string, {
        x = 0,
        y = 0
    }: {
        x ? : number;y ? : number
    } = {}): Promise < void > {
        const entity = EntityManager.getEntity(entityId);
        if (!entity) return;

        const transform = entity.getComponent < Transform2DComponent > (TRANSFORM2D);
        if (!transform) return;

        transform.position.x = x;
        transform.position.y = y;

        this.syncContainerWithTransform(entityId);
    }

    /** Returns the stored transform position. */
    static getPosition(entityId: string): Vec2 | undefined {
        const entity = EntityManager.getEntity(entityId);
        if (!entity) return;

        const transform = entity.getComponent < Transform2DComponent > (TRANSFORM2D);
        if (!transform) return;

        return transform.position;
    }

    /** Returns the stored transform size. */
    static getSize(entityId: string): Vec2 | undefined {
        const entity = EntityManager.getEntity(entityId);
        if (!entity) return;

        const transform = entity.getComponent < Transform2DComponent > (TRANSFORM2D);
        if (!transform) return;

        return transform.size;
    }

    /** Updates rotation and synchronizes the container. */
    static setRotation(entityId: string, rotation: number): void {
        const entity = EntityManager.getEntity(entityId);
        if (!entity) return;

        const transform = entity.getComponent < Transform2DComponent > (TRANSFORM2D);
        if (!transform) return;

        transform.rotation = rotation;
        this.syncContainerWithTransform(entityId);
    }

    /** Mirrors transform properties onto the PIXI container. */
    static syncContainerWithTransform(entityId: string): void {
        const entity = EntityManager.getEntity(entityId);
        if (!entity) return;

        const containerComp = entity.getComponent < ContainerComponent > (CONTAINER);
        const transform = entity.getComponent < Transform2DComponent > (TRANSFORM2D);
        if (!containerComp || !containerComp.container || !transform) return;

        const container = containerComp.container;

        const sizeX = transform.size?.x ?? 0;
        const sizeY = transform.size?.y ?? 0;
        container.pivot.set(
            sizeX * (transform.anchor?.x ?? 0),
            sizeY * (transform.anchor?.y ?? 0)
        );

        container.position.set(transform.position.x, -transform.position.y);
        container.rotation = transform.rotation ?? 0;
        container.scale.set(transform.scale?.x ?? 1, transform.scale?.y ?? 1);
    }

    /** Updates container positions each tick based on transforms. */
    static update(): void {
        const stageWidth = (GameContext.get('BASE_WIDTH') as number) ?? 0;
        const stageHeight = (GameContext.get('BASE_HEIGHT') as number) ?? 0;

        const entities = EntityManager.queryEntities([TRANSFORM2D, CONTAINER]);
        for (const entity of entities) {
            const transform = entity.getComponent < Transform2DComponent > (TRANSFORM2D);
            const containerComp = entity.getComponent < ContainerComponent > (CONTAINER);
            if (!transform || !containerComp || !containerComp.container) continue;

            const container = containerComp.container;
            const screenX = stageWidth / 2 + transform.position.x;
            const screenY = stageHeight / 2 - transform.position.y;

            container.position.set(screenX, screenY);
            container.rotation = transform.rotation ?? 0;
            container.scale.set(transform.scale?.x ?? 1, transform.scale?.y ?? 1);
        }
    }

    /** Updates the stored transform scale values. */
    static setScale(entityId: string, scaleX: number, scaleY: number): void {
        const entity = EntityManager.getEntity(entityId);
        const transform = entity.getComponent < Transform2DComponent > (TRANSFORM2D);
        transform.scale = {
            x: scaleX,
            y: scaleY
        };
    }

    /** Returns the stored transform scale vector. */
    static getScale(entityId: string): Vec2 | undefined {
        const entity = EntityManager.getEntity(entityId);
        if (!entity) return;

        const transform = entity.getComponent < Transform2DComponent > (TRANSFORM2D);
        if (!transform) return;

        return transform.scale;
    }
    
    /** Resets containers and transforms during shutdown. */
    static destroy(): void {
        const entities = EntityManager.queryEntities([TRANSFORM2D, CONTAINER]);
        for (const entity of entities) {
            const transform = entity.getComponent < Transform2DComponent > (TRANSFORM2D);
            const containerComp = entity.getComponent < ContainerComponent > (CONTAINER);

            if (transform) {
                transform.position.x = 0;
                transform.position.y = 0;
                transform.rotation = 0;
                transform.scale = transform.scale ?? {
                    x: 1,
                    y: 1
                };
                transform.scale.x = 1;
                transform.scale.y = 1;
            }

            if (containerComp?.container) {
                containerComp.container.position.set(0, 0);
                containerComp.container.rotation = 0;
                containerComp.container.scale.set(1, 1);
            }
        }

        console.debug('[Transform2DSystem] Destroyed');
    }
}