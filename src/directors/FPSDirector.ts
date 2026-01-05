import Container2DSystem from '../systems/Container2DSystem';
import EntityManager from '../core/EntityManager';
import SpriteSystem from '../systems/SpriteSystem';
    
export default class FPSDirector {
    /** Initializes the FPS overlay entities and UI. */
    static async init(): Promise < void > {
        await EntityManager.createEntity('fpsMeter', 'fpsMeter');
        Container2DSystem.showGroup('fps');
        Container2DSystem.showContainer('fpsMeter', true);
        SpriteSystem.play('fpsMeter', 'idle');
    }
}