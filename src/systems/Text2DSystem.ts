import * as PIXI from 'pixi.js';
import { Assets, BitmapFont } from 'pixi.js';
import EntityManager from '../core/EntityManager';
import ComponentType from '../core/ComponentType';
import EventBus from '../utils/EventBus';
import type Entity from '../core/Entity';

interface BitmapTextComponent {
    text: string;
    fontFamily ? : string;
    fontSize ? : number;
    align ? : string;
    position ? : {x: number;y: number};
    color ? : number;
    visible ? : boolean;
    object2D ? : PIXI.BitmapText | null;
}

export default class Text2DSystem {
    /** Registers bitmap text creation on EventBus. */
    static init(): void {

        EventBus.on(ComponentType.BITMAPTEXT, (entityId: string) => {
            return Promise.resolve(this.addEntity(entityId));
        });
    }

    /** Adds the PIXI.BitmapText object to the entity container. */
    static addEntity(entityId: string): void {
        const entity = EntityManager.getEntity(entityId);
        const textComp = entity.getComponent < BitmapTextComponent > (ComponentType.BITMAPTEXT);
        const containerComp = entity.getComponent < {container ? : PIXI.Container} > (ComponentType.CONTAINER);

        if (!textComp || !containerComp?.container) return;

        const container = containerComp.container;
        const pixiText = new PIXI.BitmapText(textComp.text, {
            fontFamily: textComp.fontFamily,
            fontSize: textComp.fontSize,
            align: textComp.align,
        });

        pixiText.x = textComp.position?.x ?? 0;
        pixiText.y = textComp.position?.y ?? 0;
        pixiText.tint = textComp.color ?? 0xffffff;
        pixiText.visible = textComp.visible ?? true;

        container.addChild(pixiText);

        textComp.object2D = pixiText;
    }

    /** Computes font scale factor against the base font size. */
    static getFontScale(entityId: string): number {
        return this.getFontMetrics(entityId).scale;
    }

    /** Retrieves glyph metrics and spacing for the font. */
    static getFontMetrics(entityId: string): FontMetrics {
        const entity = EntityManager.getEntity(entityId);
        const textComp = entity?.getComponent<BitmapTextComponent>(ComponentType.BITMAPTEXT);
        if (!textComp) throw new Error('Missing BitmapTextComponent');

        const font = Assets.get(`${textComp.fontFamily}.fnt`) as BitmapFont;
        if (!font) throw new Error('BitmapFont not loaded');

        const scale = textComp.fontSize / font.size;

        const glyphs = new Map<number, number>();

        for (const glyph of Object.values(font.chars)) {
            glyphs.set(glyph.id, glyph.xAdvance * scale);
        }

        let spaceWidth = glyphs.get(32);
        if (!spaceWidth) {
            const avg =
            [...glyphs.values()].reduce((a, b) => a + b, 0) / glyphs.size;
            spaceWidth = avg * 0.5;
        }

        return {
            baseSize: font.size,
            scale,
            spaceWidth,
            glyphs
        };
    }

    /** Replaces a text span with spaces approximating pixel width. */
    static replaceRangeWithSpaces(entityId: string, index: number, length: number, pixelWidth: number): void {
        const metrics = this.getFontMetrics(entityId);
        const spaces = Math.ceil(pixelWidth / metrics.spaceWidth);
        const text = this.getText(entityId);
        const updated = text.slice(0, index) + ' '.repeat(spaces) + text.slice(index + length);
        
        this.setText(entityId, updated);
    }
    
    /** Calculates the offset position of the substring within text. */
    static getCharOffset(entityId: string, substring: string): number {
        const entity = EntityManager.getEntity(entityId);
        const textComp = entity?.getComponent<BitmapTextComponent>(ComponentType.BITMAPTEXT);
        const bt = textComp?.object2D;
        if (!bt) return 0;

        const index = bt.text.indexOf(substring);
        if (index < 0) return 0;

        const text = bt.text;
        const scaleX = bt.scale.x;
        const letterSpacing = bt.letterSpacing ?? 0;
        const font = Assets.get(textComp.fontFamily + '.fnt') as PIXI.BitmapFont | undefined;
        if (!font) return 0;

        const nativeSize = font.size;
        const requestedSize = textComp.fontSize ?? nativeSize;
        const fontScale = requestedSize / nativeSize;

        let x = 0;
        for (let i = 0; i < index; i++) {
            const charCode = text.charCodeAt(i);
            const glyph = Object.values(font.chars).find(g => g.id === charCode);
            let advance = glyph?.xAdvance;
            advance += letterSpacing;
            if(!advance){ advance = requestedSize;};
            x += advance * fontScale * scaleX;
        }
        return x;
    }
        
    /** Reads the current bitmap text string. */
    static getText(entityId: string, text:String): void {
        const entity = EntityManager.getEntity(entityId);
        const textComp = entity?.getComponent<BitmapTextComponent>(ComponentType.BITMAPTEXT);
        return textComp.object2D.text;    
    }

    /** Updates the bitmap text with a new string. */
    static setText(entityId: string, text:String): void {
        const entity = EntityManager.getEntity(entityId);
        if(!entity) return;
        const textComp = entity?.getComponent<BitmapTextComponent>(ComponentType.BITMAPTEXT);
        textComp.object2D.text = text;    
    }

    /** Removes the PIXI text object from its container. */
    static removeEntity(entityId: string): void {
        const entity = EntityManager.getEntity(entityId);
        if (!entity) return;

        const textComp = entity.getComponent < BitmapTextComponent > (ComponentType.BITMAPTEXT);
        const containerComp = entity.getComponent < {
            container ? : PIXI.Container
        } > (ComponentType.CONTAINER);
        if (!textComp || !containerComp?.container) return;

        const pixiText = textComp.object2D;

        if (pixiText) {
            containerComp.container.removeChild(pixiText);
            pixiText.destroy({
                children: true
            });
        }

        textComp.object2D = null;
    }

    /** Cleans up all bitmap text children and references. */
    static destroy(): void {
        const entities = EntityManager.queryEntities([ComponentType.BITMAPTEXT, ComponentType.CONTAINER]) as Entity[];
        for (const entity of entities) {
            const textComp = entity.getComponent < BitmapTextComponent > (ComponentType.BITMAPTEXT);
            const pixiText = textComp?.object2D;
            const containerComp = entity.getComponent < {
                container ? : PIXI.Container
            } > (ComponentType.CONTAINER);

            if (pixiText && containerComp?.container) {
                containerComp.container.removeChild(pixiText);
                pixiText.destroy({
                    children: true
                });
            }

            if (textComp) {
                textComp.object2D = null;
            }
        }
    }
}