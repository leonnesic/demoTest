import Container2DSystem from '../systems/Container2DSystem';
import EntityManager from '../core/EntityManager';
import SpriteSystem from '../systems/SpriteSystem';
import Tween2DSystem from '../systems/Tween2DSystem';
import ZOrderSystem from '../systems/ZOrderSystem';

export default class CardDirector {
    private static cards: string[] = [];

    /** Spawns card entities and displays them in the scene. */
    static async create(size: number): Promise < string[] > {
        this.cards = Array.from({length: size}, (_, i) => {
            const entityId = `card_${i + 1}`;
            EntityManager.createEntity('card', entityId);
            ZOrderSystem.moveEntityToBottom(entityId);
            SpriteSystem.play(entityId, 'idle');
            Container2DSystem.showContainer(entityId);
            return entityId;
        });
        return this.cards;
    }

    /** Runs the ordered tween sequence for the cards. */
    static async start(target: string): Promise < void > {
        const ordered = [...CardDirector.cards].reverse();
        await ordered.reduce < Promise < void >> ((chain, entityId) => {
            return chain.then(() => {
                return Tween2DSystem.tweenNamed(entityId, target, {});
            });
        }, Promise.resolve());
    }

    /** Resets card tweens and reorders their z-index. */
    static reset(tweenName: string): void {
        this.cards.forEach((entityId, index) => {
            Tween2DSystem.killAll(entityId);
            Tween2DSystem.tweenNamed(entityId, tweenName);
            ZOrderSystem.moveEntityToBottom(entityId);
        });
    }
}