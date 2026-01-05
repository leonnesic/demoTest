import * as PIXI from 'pixi.js';
import EntityManager from '../core/EntityManager';
import ComponentType from '../core/ComponentType';
import EventBus from '../utils/EventBus';

export type ShapeKind = 'rect' | 'circle' | 'ellipse';

export interface Shape2DComponent {
    shape ? : ShapeKind;
    size ? : {
        x: number;y: number
    };
    radius ? : number;
    position ? : {
        x: number;y: number
    };
    pivot ? : {
        x: number;y: number
    };
    scale ? : {
        x: number;y: number
    };
    color ? : number;
    alpha ? : number;
    strokeWidth ? : number;
    strokeColor ? : number;
    gradient ? : {
        colors: number[];
        stops ? : number[];
    } | null;
    graphics ? : PIXI.Graphics | null;
}

export default class Shape2DSystem {
    private static gradientCache = new Map < string, PIXI.Texture > ();

    /** Reacts to shape components to build graphics on creation. */
    static init(): void {
        EventBus.on(ComponentType.SHAPE2D, (entityId: string) => {
            this.createShape(entityId);
        });
    }

    /** Creates the PIXI graphics defined by the shape component. */
    static createShape(entityId: string): void {
        const entity = EntityManager.getEntity(entityId);
        if (!entity) return;

        const shapeComp = entity.getComponent < Shape2DComponent > (ComponentType.SHAPE2D);
        const containerComp = entity.getComponent < {
            container ? : PIXI.Container
        } > (ComponentType.CONTAINER);
        if (!shapeComp || !containerComp?.container) return;

        shapeComp.size = shapeComp.size ?? {
            x: 0,
            y: 0
        };
        shapeComp.position = shapeComp.position ?? {
            x: 0,
            y: 0
        };
        shapeComp.pivot = shapeComp.pivot ?? {
            x: 0,
            y: 0
        };
        shapeComp.scale = shapeComp.scale ?? {
            x: 1,
            y: 1
        };
        shapeComp.color = shapeComp.color ?? 0xffffff;
        shapeComp.alpha = shapeComp.alpha ?? 1;
        shapeComp.radius = shapeComp.radius ?? 0;
        shapeComp.strokeWidth = shapeComp.strokeWidth ?? 0;
        shapeComp.strokeColor = shapeComp.strokeColor ?? 0x000000;
        shapeComp.gradient = shapeComp.gradient ?? null;

        const g = new PIXI.Graphics();

        if ((shapeComp.strokeWidth ?? 0) > 0) {
            g.lineStyle({
                width: shapeComp.strokeWidth,
                color: shapeComp.strokeColor!,
                alpha: 1,
            });
        } else {
            g.lineStyle(0);
        }

        if (shapeComp.gradient && shapeComp.size.x > 0 && shapeComp.size.y > 0) {
            const {
                colors,
                stops
            } = shapeComp.gradient;
            const tex = Shape2DSystem.createGradientTexture(colors, stops, shapeComp.size.x, shapeComp.size.y);
            g.beginTextureFill({
                texture: tex
            });
        } else {
            g.beginFill(shapeComp.color!, shapeComp.alpha);
        }

        switch (shapeComp.shape) {
            case 'circle':
                g.drawCircle(0, 0, shapeComp.radius ?? Math.min(shapeComp.size.x, shapeComp.size.y) / 2);
                break;
            case 'ellipse':
                g.drawEllipse(0, 0, (shapeComp.size.x ?? 0) / 2, (shapeComp.size.y ?? 0) / 2);
                break;
            case 'rect':
            default:
                if ((shapeComp.radius ?? 0) > 0) {
                    g.drawRoundedRect(0, 0, shapeComp.size.x, shapeComp.size.y, shapeComp.radius);
                } else {
                    g.drawRect(0, 0, shapeComp.size.x, shapeComp.size.y);
                }
                break;
        }

        g.endFill();

        g.pivot.set(shapeComp.pivot.x, shapeComp.pivot.y);
        g.position.set(shapeComp.position.x, shapeComp.position.y);
        g.scale.set(shapeComp.scale.x, shapeComp.scale.y);

        shapeComp.graphics = g;
        containerComp.container.addChild(g);
    }

    /** Updates the stored size and redraws the shape. */
    static setSize(entityId: string, width: number, height: number): void {
        const entity = EntityManager.getEntity(entityId);
        const shapeComp = entity?.getComponent < Shape2DComponent > (ComponentType.SHAPE2D);
        if (!shapeComp) return;

        shapeComp.size = {
            x: width,
            y: height
        };
        this.redraw(entityId);
    }

    /** Retrieves the current stored size for the shape. */
    static getSize(entityId: string): {
        x: number;y: number
    } | undefined {
        const entity = EntityManager.getEntity(entityId);
        return entity?.getComponent < Shape2DComponent > (ComponentType.SHAPE2D)?.size;
    }

    /** Adjusts the rendered scale of the shape. */
    static setScale(entityId: string, scaleX: number, scaleY: number): void {
        const entity = EntityManager.getEntity(entityId);
        const shapeComp = entity?.getComponent < Shape2DComponent > (ComponentType.SHAPE2D);
        if (!shapeComp || !shapeComp.graphics) return;

        shapeComp.scale = {
            x: scaleX,
            y: scaleY
        };
        shapeComp.graphics.scale.set(scaleX, scaleY);
    }

    /** Updates fill color data and triggers redraw. */
    static updateColor(entityId: string, color: number, alpha = 1): void {
        const entity = EntityManager.getEntity(entityId);
        const shapeComp = entity?.getComponent < Shape2DComponent > (ComponentType.SHAPE2D);
        if (!shapeComp) return;

        shapeComp.color = color;
        shapeComp.alpha = alpha;
        this.redraw(entityId);
    }

    /** Redraws the shape graphics using current settings. */
    static redraw(entityId: string): void {
        const entity = EntityManager.getEntity(entityId);
        const shapeComp = entity?.getComponent < Shape2DComponent > (ComponentType.SHAPE2D);
        const containerComp = entity?.getComponent < {
            container ? : PIXI.Container
        } > (ComponentType.CONTAINER);
        if (!shapeComp || !shapeComp.graphics || !containerComp?.container) return;

        const g = shapeComp.graphics;
        g.clear();

        if ((shapeComp.strokeWidth ?? 0) > 0) {
            g.lineStyle({
                width: shapeComp.strokeWidth,
                color: shapeComp.strokeColor!,
                alpha: 1,
            });
        } else {
            g.lineStyle(0);
        }

        if (shapeComp.gradient && shapeComp.size.x > 0 && shapeComp.size.y > 0) {
            const {
                colors,
                stops
            } = shapeComp.gradient;
            const tex = Shape2DSystem.createGradientTexture(colors, stops, shapeComp.size.x, shapeComp.size.y);
            g.beginTextureFill({
                texture: tex
            });
        } else {
            g.beginFill(shapeComp.color!, shapeComp.alpha);
        }

        if ((shapeComp.radius ?? 0) > 0 && (shapeComp.shape === 'rect' || !shapeComp.shape)) {
            g.drawRoundedRect(0, 0, shapeComp.size.x, shapeComp.size.y, shapeComp.radius);
        } else if (shapeComp.shape === 'circle') {
            g.drawCircle(0, 0, shapeComp.radius ?? Math.min(shapeComp.size.x, shapeComp.size.y) / 2);
        } else if (shapeComp.shape === 'ellipse') {
            g.drawEllipse(0, 0, shapeComp.size.x / 2, shapeComp.size.y / 2);
        } else {
            g.drawRect(0, 0, shapeComp.size.x, shapeComp.size.y);
        }

        g.endFill();
    }

    /** Removes the graphics child and cleans up textures. */
    static destroy(entityId: string): void {
        const entity = EntityManager.getEntity(entityId);
        const shapeComp = entity?.getComponent < Shape2DComponent > (ComponentType.SHAPE2D);
        const containerComp = entity?.getComponent < {
            container ? : PIXI.Container
        } > (ComponentType.CONTAINER);
        if (!shapeComp || !containerComp?.container) return;

        const g = shapeComp.graphics;
        if (g && containerComp.container.children.includes(g)) {
            containerComp.container.removeChild(g);
            try {
                g.destroy({
                    children: true
                });
            } catch {
                /* ignore */
            }
            shapeComp.graphics = null;
        }
    }

    /** Caches and returns gradient textures for fills. */
    private static createGradientTexture(colors: number[], stops: number[] | undefined, width: number, height: number):
        PIXI.Texture {
            const key = `${colors.join(',')}|${(stops ?? []).join(',')}|${width}x${height}`;
            const cached = this.gradientCache.get(key);
            if (cached) return cached;

            const canvas = document.createElement('canvas');
            canvas.width = Math.max(1, Math.round(width));
            canvas.height = Math.max(1, Math.round(height));
            const ctx = canvas.getContext('2d');
            if (!ctx) return PIXI.Texture.EMPTY;

            const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            colors.forEach((c, i) => {
                const stop = stops?.[i] ?? (colors.length > 1 ? i / (colors.length - 1) : 0);
                grad.addColorStop(stop, `#${c.toString(16).padStart(6, '0')}`);
            });

            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const tex = PIXI.Texture.from(canvas);
            this.gradientCache.set(key, tex);
            return tex;
        }
}