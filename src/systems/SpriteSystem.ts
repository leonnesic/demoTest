import ComponentType from '../core/ComponentType';
import * as PIXI from 'pixi.js';
import EntityManager from '../core/EntityManager';
import EventBus from '../utils/EventBus';
import type Entity from '../core/Entity';
import {
    Texture,
    Assets
} from 'pixi.js';

interface SpriteComponent {
    sprites: Record < string,
    PIXI.AnimatedSprite | null > ;
    animations ? : Record < string,
    any > ;
}

interface StateComponent {
    symbols ? : Record < string, {
        size ? : {
            x ? : number;y ? : number
        };
        offset ? : {
            x ? : number;y ? : number
        };
    } > ;
}

export default class SpriteSystem {

    /** Subscribes sprite creation to the component lifecycle. */
    static init(): void {
        EventBus.on(ComponentType.SPRITE, (entityId: string) =>
            Promise.resolve(this.createSpriteAsync(entityId))
        );
    }

    /** Creates animated sprites for every animation frame definition. */
    static async createSpriteAsync(entityId: string): Promise < void > {
        const entity = EntityManager.getEntity(entityId);
        if (!entity) return;

        const spriteComp = entity.getComponent < SpriteComponent > (ComponentType.SPRITE);
        const containerComp = entity.getComponent < {
            container ? : PIXI.Container
        } > (ComponentType.CONTAINER);

        if (!spriteComp || !containerComp?.container) return;

        spriteComp.sprites ||= {};

        for (const [animName, animData] of Object.entries(spriteComp.animations ?? {})) {
            const frames = animData.frames;
            if (!Array.isArray(frames) || !frames.length) continue;

            const textures = frames.map((f: string) =>
                PIXI.Texture.from(f + '.png')
            );

            if (!textures.length) continue;

            const sprite = new PIXI.AnimatedSprite(textures);
            sprite.name = animName;
            sprite.visible = false;

            // sprite.anchor.set(
            // animData.anchor?.x ?? 0.5,
            // animData.anchor?.y ?? 0.5
            // );

            sprite.x = animData.position?.x ?? 0;
            sprite.y = animData.position?.y ?? 0;

            sprite.animationSpeed = animData.speed ?? 1;
            sprite.loop = animData.loop ?? false;

            containerComp.container.addChild(sprite);
            spriteComp.sprites[animName] = sprite;
        }
    }

    /** Adjusts symbol positioning based on state metadata. */
    static applySymbolLayout(
        sprite: PIXI.AnimatedSprite,
        stateComp: StateComponent | undefined,
        symbolName: string
    ): void {
        const symbolData = stateComp?.symbols?.[symbolName];
        if (!symbolData) return;

        if (symbolData.size) {
            sprite.width = symbolData.size.x ?? sprite.width;
            sprite.height = symbolData.size.y ?? sprite.height;
        }

        sprite.x += symbolData.offset?.x ?? 0;
        sprite.y += symbolData.offset?.y ?? 0;
    }

    /** Plays the named animation and optionally repositions it. */
    static async play(entityId: string, animName: string, pos ? : {
        x: number;y: number
    }): void {
        const entity = EntityManager.getEntity(entityId);
        const spriteComp = entity?.getComponent < SpriteComponent > (ComponentType.SPRITE);
        const sprite = spriteComp.sprites[animName];

        if (pos) {
            sprite.x = pos.x;
            sprite.y = pos.y;
        }

        for (const s of Object.values(spriteComp.sprites)) {
            s.visible = false;
            s.stop();
        }

        sprite.visible = true;
        sprite.play();
    }

    /** Returns the pixel size of the active sprite animation. */
    static getSpriteSize(entityId: string, animationName: string): {
        width: number;height: number
    } | undefined {
        const entity = EntityManager.getEntity(entityId);
        const spriteComp = entity?.getComponent < SpriteComponent > (ComponentType.SPRITE);
        if (!spriteComp) return;

        const sprite = spriteComp.sprites[animationName];
        if (!sprite) return;

        return {
            width: sprite.width * sprite.scale.x,
            height: sprite.height * sprite.scale.y
        };
    }

    /** Sets precise position for the requested sprite. */
    static setSpritePosition(entityId: string, animationName: string, pos: {
        x: number;y: number
    }): void {
        const entity = EntityManager.getEntity(entityId);
        const spriteComp = entity?.getComponent < SpriteComponent > (ComponentType.SPRITE);
        if (!spriteComp) return;
        const sprite = spriteComp.sprites[animationName];
        if (!sprite) return;
        sprite.x = pos.x;
        sprite.y = pos.y;
    }

    /** Stops all animations for the entity. */
    static stop(entityId: string): void {
        const entity = EntityManager.getEntity(entityId) as Entity | undefined;
        const spriteComp = entity?.getComponent < SpriteComponent > (ComponentType.SPRITE);
        if (!spriteComp) return;

        for (const sprite of Object.values(spriteComp.sprites)) {
            sprite?.stop();
        }
    }

    /** Cleans up sprites and removes them from containers. */
    static destroy(entityId: string): void {
        const entity = EntityManager.getEntity(entityId) as Entity | undefined;
        const spriteComp = entity?.getComponent < SpriteComponent > (ComponentType.SPRITE);
        if (!spriteComp) return;

        for (const sprite of Object.values(spriteComp.sprites)) {
            sprite?.stop();
            sprite?.removeAllListeners?.();
            sprite?.destroy({
                children: true,
                texture: true,
                baseTexture: true
            });
        }

        spriteComp.sprites = {};
    }

    /** Loads textures from remote URLs and treats them as sprites. */
    static async addImageFromUrl(entityId: string, payloads: {
        name: string;url: string
    } [], position: {
        x: number;y: number
    }): Promise < void > {
        const entity = EntityManager.getEntity(entityId);
        if (!entity) return;

        const spriteComp = entity.getComponent(ComponentType.SPRITE);
        const containerComp = entity.getComponent(ComponentType.CONTAINER);
        if (!spriteComp || !containerComp?.container) return;
        spriteComp.sprites ||= {};

        for (const payload of payloads) {
            const response = await fetch(payload.url);
            const blob = await response.blob();
            const bitmap = await createImageBitmap(blob);
            const texture = PIXI.Texture.from(bitmap);

            const sprite = new PIXI.AnimatedSprite([texture]);
            sprite.name = payload.name;
            sprite.x = position?.x ?? 0;
            sprite.y = position?.y ?? 0;
            sprite.visible = false;
            sprite.loop = false;
            sprite.animationSpeed = 0;

            containerComp.container.visible = true;
            containerComp.container.addChild(sprite);
            spriteComp.sprites[payload.name] = sprite;
        }

    }
}