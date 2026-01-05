import * as PIXI from 'pixi.js';
import EntityManager from '../core/EntityManager';
import ComponentType from '../core/ComponentType';
import EventBus from '../utils/EventBus';
import {
    Assets
} from 'pixi.js';

type RuntimeParticle = PIXI.Particle & {
    vx: number;
    vy: number;
    age: number;
    life: number;
};

interface ParticleEmitterRuntime {
    container: PIXI.ParticleContainer;
    particles: RuntimeParticle[];
    textures: PIXI.Texture[];
    config: any;
    accumulator: number;
}

interface EntityRuntime {
    emitters: ParticleEmitterRuntime[];
}

export default class Particle2DSystem {
    private static runtime = new Map < string, EntityRuntime > ();

    /** Attaches particle listener to entity creation events. */
    static init(): void {
        EventBus.on(ComponentType.PARTICLE2D, (entityId: string) => {
            this.addEntity(entityId);
        });
    }

    /** Sets up runtime emitters for the entity’s particle component. */
    static addEntity(entityId: string): void {
        const entity = EntityManager.getEntity(entityId);
        if (!entity) return;

        const particleComp = entity.getComponent(ComponentType.PARTICLE2D);
        const containerComp = entity.getComponent(ComponentType.CONTAINER);
        if (!particleComp || !containerComp) return;

        const emitters: ParticleEmitterRuntime[] = [];

        for (const ref of particleComp.emitters) {
            const rawConfig = Assets.get(ref.effectId);
            if (!rawConfig) {
                console.warn(`[Particle2DSystem] Missing config: ${ref.effectId}`);
                continue;
            }

            const config = rawConfig;
            const textures: PIXI.Texture[] =
                config.textures?.map((t: string) => PIXI.Texture.from(t)) ?? [PIXI.Texture.from(ref.textureId)];

            const container = new PIXI.ParticleContainer({
                dynamicProperties: {
                    position: true,
                    rotation: true,
                    color: true,
                    vertex: true,
                },
            });

            containerComp.container.addChild(container);

            emitters.push({
                container,
                particles: [],
                textures,
                config,
                accumulator: 0,
            });
        }

        this.runtime.set(entityId, {
            emitters
        });
    }

    /** Removes runtime containers and clears particle lists. */
    static removeEntity(entityId: string): void {
        const entityRuntime = this.runtime.get(entityId);
        if (!entityRuntime) return;

        for (const emitter of entityRuntime.emitters) {
            emitter.container.destroy({
                children: true
            });
            emitter.particles.length = 0;
        }

        this.runtime.delete(entityId);
    }

    /** Emits and steps particles for every running emitter. */
    static update(dt: number): void {
        for (const entityRuntime of this.runtime.values()) {
            for (const emitter of entityRuntime.emitters) {
                this.emit(emitter, dt);
                this.updateParticles(emitter, dt);
            }
        }
    }

    /** Emits new particles according to the emitter’s config. */
    private static emit(runtime: ParticleEmitterRuntime, dt: number): void {
        const cfg = runtime.config;
        runtime.accumulator += dt * cfg.emissionRate;

        while (runtime.accumulator >= 1 && runtime.particles.length < cfg.maxParticles) {
            runtime.accumulator--;

            const angle =
                (cfg.direction.angle +
                    (Math.random() - 0.5) * cfg.direction.spread) *
                (Math.PI / 180);

            const speed =
                cfg.speed.min + Math.random() * (cfg.speed.max - cfg.speed.min);

            const life =
                cfg.lifetime.min + Math.random() * (cfg.lifetime.max - cfg.lifetime.min);

            const tex = runtime.textures[Math.floor(Math.random() * runtime.textures.length)];

            const p = new PIXI.Particle({
                texture: tex,
                x: cfg.pos.x,
                y: cfg.pos.y
            }) as RuntimeParticle;

            p.vx = Math.cos(angle) * speed;
            p.vy = Math.sin(angle) * speed;
            p.life = life;
            p.age = 0;

            runtime.container.addParticle(p);
            runtime.particles.push(p);
        }
    }

    /** Updates particle motion, color, and lifecycle each frame. */
    private static updateParticles(runtime: ParticleEmitterRuntime, dt: number): void {
        const cfg = runtime.config;

        for (let i = runtime.particles.length - 1; i >= 0; i--) {
            const p = runtime.particles[i];
            p.age += dt;

            if (p.age >= p.life) {
                runtime.container.removeParticle(p);
                runtime.particles.splice(i, 1);
                continue;
            }

            const t = p.age / p.life;

            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vy += (cfg.gravity?.y ?? 0) * dt;

            // Multi-stop interpolation
            p.alpha = this.interpolateCurve(cfg.alpha.list, t);
            const scale = this.interpolateCurve(cfg.scale.list, t);
            p.scaleX = scale;
            p.scaleY = scale;

            const colorHex = this.interpolateColor(cfg.color.list, t);
            p.tint = new PIXI.Color(colorHex).toNumber(); // numeric tint for Pixi v8
        }
    }

    /** Removes all particles and clears runtime caches. */
    static destroy(): void {
        for (const id of this.runtime.keys()) {
            this.removeEntity(id);
        }
        this.runtime.clear();
    }

    /** Interpolates numeric curves for particle properties. */
    private static interpolateCurve(list: {
        value: number;time: number
    } [], t: number): number {
        if (!list || list.length === 0) return 1;
        for (let i = 0; i < list.length - 1; i++) {
            const a = list[i],
                b = list[i + 1];
            if (t >= a.time && t <= b.time) {
                const f = (t - a.time) / (b.time - a.time);
                return a.value + (b.value - a.value) * f;
            }
        }
        return list[list.length - 1]?.value ?? 1;
    }

    /** Interpolates a color string along defined stops. */
    private static interpolateColor(list: {
        value: string;time: number
    } [], t: number): string {
        if (!list || list.length === 0) return '#ffffff';

        const normalize = (val ? : string) => {
            if (!val) return '#ffffff';
            return val.startsWith('#') ? val : '#' + val;
        };

        for (let i = 0; i < list.length - 1; i++) {
            const a = list[i],
                b = list[i + 1];
            if (!a?.value || !b?.value) continue;

            if (t >= a.time && t <= b.time) {
                const f = (t - a.time) / (b.time - a.time);
                const ca = new PIXI.Color(normalize(a.value)).toRgbArray();
                const cb = new PIXI.Color(normalize(b.value)).toRgbArray();
                const cr = ca.map((c, idx) => c + (cb[idx] - c) * f);
                return new PIXI.Color(cr).toHex();
            }
        }

        return normalize(list[list.length - 1]?.value);
    }
}