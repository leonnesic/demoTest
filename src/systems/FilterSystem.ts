import {
    OutlineFilter
} from '@pixi/filter-outline';
import gsap from 'gsap';
import ComponentType from '../core/ComponentType';
import EntityManager from '../core/EntityManager';
import EventBus from '../utils/EventBus';
import type Entity from '../core/Entity';
import type * as PIXI from 'pixi.js';

export default class FilterSystem {
    static tweens: WeakMap < object, any > = new WeakMap();
    static filters: WeakMap < object, OutlineFilter | null > = new WeakMap();

    /** Hooks filter creation into the event bus. */
    static init(): void {
        EventBus.on(ComponentType.FILTER, (entityId: string) => {
            this.addEntity(entityId);
        });
    }

    /** Applies outlined filters and optional animation on the entity. */
    static addEntity(entityId: string): void {
        const entity = EntityManager.getEntity(entityId);
        if (!entity) return;

        const filterComp = entity.getComponent < any > (ComponentType.FILTER);
        const containerComp = entity.getComponent < any > (ComponentType.CONTAINER);
        if (!filterComp || !containerComp) return;

        const sprite = (containerComp.getContainer?.() ?? containerComp.container) as PIXI.Container | PIXI.Sprite |
            undefined;
        if (!sprite) return;

        let pixiFilter: OutlineFilter | null = null;
        let tween: any | null = null;

        if (filterComp.filterType === 'outline') {
            pixiFilter = new OutlineFilter(filterComp.thickness, filterComp.color);
            sprite.filters = [pixiFilter];

            if (filterComp.animate) {
                tween = gsap.to(pixiFilter, {
                    alpha: 0,
                    duration: 0.5,
                    yoyo: true,
                    repeat: -1,
                    ease: 'sine.inOut',
                });
            }
        }

        this.filters.set(entity, pixiFilter);
        if (tween) this.tweens.set(entity, tween);
    }

    /** Removes filters and animated tweens from an entity. */
    static removeEntity(entityOrId: Entity | string): void {
        const entity = typeof entityOrId === 'string' ? EntityManager.getEntity(entityOrId) : (
        entityOrId as Entity);
        if (!entity) return;

        const filterComp = entity.getComponent < any > (ComponentType.FILTER);
        const containerComp = entity.getComponent < any > (ComponentType.CONTAINER);
        if (!filterComp || !containerComp) return;

        const sprite = (containerComp.getContainer?.() ?? containerComp.container) as PIXI.Container | PIXI.Sprite |
            undefined;

        const tween = this.tweens.get(entity);
        if (tween) {
            tween.kill?.();
            this.tweens.delete(entity);
        }

        if (sprite) {
            sprite.filters = [];
        }

        this.filters.delete(entity);
    }

    /** Synchronizes filter properties on each update tick. */
    static update(): void {
            const entities = EntityManager.queryEntities([ComponentType.FILTER, ComponentType.CONTAINER];

                for (const entity of entities) {
                    const filterComp = entity.getComponent < any > (ComponentType.FILTER);
                    const containerComp = entity.getComponent < any > (ComponentType.CONTAINER);
                    if (!filterComp || !containerComp) continue;

                    const sprite = (containerComp.getContainer?.() ?? containerComp.container) as PIXI.Container |
                        PIXI.Sprite | undefined;
                    if (!sprite) continue;

                    let pixiFilter = this.filters.get(entity);

                    if (!pixiFilter) {
                        this.addEntity(entity.name ?? (entity as any).id);
                        pixiFilter = this.filters.get(entity);
                    }

                    if (!pixiFilter) continue;

                    if ((pixiFilter as any).color !== filterComp.color) {
                        (pixiFilter as any).color = filterComp.color;
                    }
                    if ((pixiFilter as any).thickness !== filterComp.thickness) {
                        (pixiFilter as any).thickness = filterComp.thickness;
                    }

                    sprite.filters = [pixiFilter];
                }
            }

            /** Pauses the running filter tween for the entity. */
            static pauseFilter(entity: Entity): void {
                const tween = this.tweens.get(entity);
                tween?.pause?.();
            }

            /** Resumes a paused filter tween. */
            static resumeFilter(entity: Entity): void {
                const tween = this.tweens.get(entity);
                tween?.resume?.();
            }

            /** Clears filters, tweens, and restores defaults. */
            static destroy(): void {
                const entities = EntityManager.queryEntities([ComponentType.FILTER, ComponentType.CONTAINER];

                    for (const entity of entities) {
                        const container = entity.getComponent < any > (ComponentType.CONTAINER);
                        const sprite = container?.getContainer?.() ?? container?.container;
                        const tween = this.tweens.get(entity);

                        if (tween) {
                            tween.kill?.();
                            this.tweens.delete(entity);
                        }

                        if (sprite) {
                            sprite.filters = [];
                        }

                        this.filters.delete(entity);
                    }

                    this.tweens = new WeakMap(); this.filters = new WeakMap();

                    console.log('[FilterSystem] Destroyed');
                }
            }