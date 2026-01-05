import gsap from 'gsap';
import ComponentType from '../core/ComponentType';
import EntityManager from '../core/EntityManager';
import EventBus from '../utils/EventBus';
import type Entity from '../core/Entity';

export default class Tween2DSystem {
    static activeTweens: Map < string, Map < string, any >> = new Map();
    static requiredComponents: string[] = [ComponentType.TWEEN2D];

    /** Hooks tween lifecycle into EventBus and entity destruction. */
    static init(): void {
        EventBus.on(ComponentType.TWEEN2D, this.addEntity);
        EventBus.on('entityDestroyed', this.removeEntity);
    }

    /** Prepares storage for a new entity’s tweens. */
    static addEntity = (entityId: string): void => {
        if (!this.activeTweens.has(entityId)) {
            this.activeTweens.set(entityId, new Map());
        }
    };

    /** Kills and unregisters tweens when an entity is removed. */
    static removeEntity = (entityId: string): void => {
        this.killAll(entityId);
        this.activeTweens.delete(entityId);
    };

    /** Registers a tween instance and wires onComplete cleanup. */
    static register(entityId: string, name: string, tween: any, overwrite = true): any {
        const map = this.activeTweens.get(entityId);
        if (!map) return tween;

        if (overwrite) {
            map.forEach((t) => t.kill());
            map.clear();
        }

        map.set(name, tween);

        const prevOnComplete = tween.eventCallback?.('onComplete');

        tween.eventCallback?.('onComplete', () => {
            prevOnComplete?.();
            map.delete(name);
        });


        return tween;
    }


    /** Retrieves a registered tween for the entity. */
    static get(entityId: string, name: string): any | undefined {
        return this.activeTweens.get(entityId)?.get(name);
    }

    /** Kills the tween by name if present. */
    static kill(entityId: string, name: string): void {
        this.get(entityId, name)?.kill();
    }

    /** Kills every tween running on the entity. */
    static killAll(entityId: string): void {
        const map = this.activeTweens.get(entityId);
        map?.forEach((t) => t.kill());
        map?.clear();
    }

    /** Pauses every tween for the entity. */
    static pauseAll(entityId: string): void {
        this.activeTweens.get(entityId)?.forEach((t) => t.pause());
    }

    /** Resumes every paused tween for the entity. */
    static resumeAll(entityId: string): void {
        this.activeTweens.get(entityId)?.forEach((t) => t.resume());
    }

    /** Resolves a target object (position/scale/rotation) for tweens. */
    static resolveTarget(entity: Entity, target: string): any {
        const transform = entity.getComponent < any > (ComponentType.TRANSFORM2D);
        const ui = entity.getComponent < any > (ComponentType.UI);

        return ({
                position: transform?.position,
                scale: transform?.scale,
                rotation: transform?.rotation,
                alpha: ui?.container?.alpha,
                container: ui?.container,
            }
        )[target];
    }

    /** Creates a to() tween definition. */
    static to(entityId: string, name: string, target: string, props: any = {}, options: any = {}): any {
        return this.create(entityId, {
            name,
            target,
            mode: 'to',
            props,
            options
        });
    }

    /** Creates a from() tween definition. */
    static from(entityId: string, name: string, target: string, props: any = {}, options: any = {}): any {
        return this.create(entityId, {
            name,
            target,
            mode: 'from',
            from: props,
            options
        });
    }

    /** Creates a combined fromTo() tween. */
    static fromTo(entityId: string, name: string, target: string, from: any, to: any, options: any = {}): any {
        return this.create(entityId, {
            name,
            target,
            mode: 'fromTo',
            from,
            to,
            options
        });
    }

    /** Constructs the requested tween and registers it. */
    static create(
        entityId: string, {
            name,
            target,
            mode,
            props = {},
            from = {},
            to = {},
            options = {},
        }: {
            name: string;
            target: string;
            mode: 'to' | 'from' | 'fromTo';
            props ? : any;
            from ? : any;
            to ? : any;
            options ? : any;
        }
    ): any {
        const entity = EntityManager.getEntity(entityId);
        if (!entity) throw new Error(`Entity ${entityId} not found`);

        const resolved = this.resolveTarget(entity, target);
        if (!resolved) throw new Error(`Target "${target}" not found`);

        const config = {
            ...props,
            ...options
        };

        let tween: any;

        if (mode === 'to') {
            tween = gsap.to(resolved, config);
        } else if (mode === 'from') {
            tween = gsap.from(resolved, {
                ...from,
                ...config
            });
        } else {
            tween = gsap.fromTo(resolved, from, {
                ...to,
                ...config
            });
        }

        return this.register(entityId, name, tween, true);
    }

    /** Builds a GSAP timeline tied to the entity. */
    static timeline(entityId: string, name: string, build: (tl: any, entity: Entity, resolveTarget: (target: string) =>
        any) => void, options: any = {}): any {
        const entity = EntityManager.getEntity(entityId);
        if (!entity) throw new Error(`Entity ${entityId} not found`);

        const tl = gsap.timeline(options);

        build(tl, entity, this.resolveTarget.bind(this, entity));

        return this.register(entityId, name, tl, true);
    }

    /** Starts a named tween definition, returning a promise on completion. */
    static tweenNamed(
        entityId: string,
        name: string,
        overrides: any = {}
    ): Promise < void > {
        const entity = EntityManager.getEntity(entityId);
        const comp = entity?.getComponent < any > (ComponentType.TWEEN2D);

        const data = comp?.tweens?.[name];
        if (!data) throw new Error(`Tween "${name}" not found`);

        return new Promise < void > ((resolve) => {
            this.create(entityId, {
                name,
                target: data.target ?? 'position',
                mode: data.mode ?? 'to',
                props: data.props ?? {},
                from: data.from ?? {},
                to: data.to ?? {},
                options: {
                    duration: data.duration,
                    ease: data.ease,
                    ...data.options,
                    ...overrides,
                    onComplete: () => {
                        overrides?.onComplete?.();
                        resolve();
                    },
                },
            });
        });
    }


    /** Kills every tween cache when tearing down. */
    static destroy(): void {
        this.activeTweens.forEach((entity) => entity.forEach((t) => t.kill()));
        this.activeTweens.clear();
    }
}