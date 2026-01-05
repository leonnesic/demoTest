import {
    Assets
} from 'pixi.js';
import GameContext from '../core/GameContext.js';
import EntityManager from '../core/EntityManager.js';
import EventBus from './EventBus.js';
import Container2DSystem from '../systems/Container2DSystem.js';
import Transform2DSystem from '../systems/Transform2DSystem.js';
import Text2DSystem from '../systems/Text2DSystem.js';
import SpriteSystem from '../systems/SpriteSystem.js';

export default class SceneBuilder {
    /** Instantiates entities defined inside the scene JSON. */
    static async build(sceneId) {
        const data = Assets.get(`${sceneId}.json`) ?? {};
        const defs = data.entities ?? [];

        const createPromises = defs.map(def =>
            EntityManager.createEntity(def.assetId, def.entityId)
        );
        await Promise.allSettled(createPromises);
        return Promise.resolve();
    }

    /** Applies transform, sprite, and text properties from the scene. */
    static applyProperties(sceneId) {
        const data = Assets.get(`${sceneId}.json`) ?? {};
        const defs = data.entities ?? [];

        for (const def of defs) {
            const transformDef = def.components?.transform2D ?? {};
            const pos = transformDef.position || {
                x: 0,
                y: 0,
                z: 0
            };
            const rot = transformDef.rotation || 0;
            const containerComp = def.components?.container ?? {};

            if (containerComp && Object.keys(containerComp).length > 0) {
                Transform2DSystem.setPosition(def.entityId, pos);
                Transform2DSystem.setRotation(def.entityId, rot);

                const animationComp = def.components?.sprite ?? {};
                if (animationComp.animation) {
                    SpriteSystem.play(def.entityId, animationComp.animation, animationComp.position, true);
                }

                const visible = containerComp.visible ?? true;
                Container2DSystem.showContainer(def.entityId, visible);
            }
            const text2DDef = def.components?.text2D ?? {};
            if (text2DDef && Object.keys(text2DDef).length > 0) {
                Text2DSystem.setText(def.entityId, text2DDef.text);
            }

        }
    }

    /** Tears down the scene, clearing entities and broadcasting unload. */
    static async unload(sceneId) {
        const data = Assets.get(`${sceneId}.json`) ?? {};
        const defs = data.entities ?? [];

        const entities = EntityManager.getAllEntities();
        for (const id of entities) EntityManager.destroyEntity(id);

        GameContext.set('currentScene', null);
        await EventBus.emitAsync('sceneUnloaded', {
            sceneId
        });
    }
}