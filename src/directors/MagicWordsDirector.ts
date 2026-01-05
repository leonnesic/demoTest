import Container2DSystem from '../systems/Container2DSystem';
import Transform2DSystem from '../systems/Transform2DSystem';
import Text2DSystem from '../systems/Text2DSystem';
import SpriteSystem from '../systems/SpriteSystem';
import DataFetchSystem from '../systems/DataFetchSystem';
import DialogueDirector from './DialogueDirector';
import TextTokenHelper from '../utils/TextTokenHelper';
import EntityManager from '../core/EntityManager';

export default class MagicWordsDirector {
    /** Builds magic word context and populates dialogue entities. */
    static async init() {
        await EntityManager.createEntity('magicWords', 'magicWords');
        const payload = await DataFetchSystem.fetch('magicWords');
        const dialogueIds = await DialogueDirector.build(payload);
        await Promise.all(dialogueIds.map(id => MagicWordsDirector.apply(id, payload)));
    }

    /** Applies emoji overlays and positioning to the dialogue entity. */
    static async apply(dialogueEntityId: string, payload: any): Promise < void > {
        const text = Text2DSystem.getText(dialogueEntityId);
        const basePos = Transform2DSystem.getPosition(dialogueEntityId);
        const scale = Text2DSystem.getFontScale(dialogueEntityId);
        const plan = TextTokenHelper.build(dialogueEntityId, text, payload.emojies);

        await Promise.all(plan.map(p => EntityManager.createEntity('emojies', p.entityId)));
        await Promise.all(plan.map(p => SpriteSystem.addImageFromUrl(p.entityId, [p.payload])));

        for (const p of plan) {
            const xOffset = Text2DSystem.getCharOffset(dialogueEntityId, "{" + p.name + "}");
            const size = SpriteSystem.getSpriteSize(p.entityId, p.name);
            Transform2DSystem.setPosition(p.entityId, {x: basePos.x + xOffset,y: basePos.y + 70});
            Transform2DSystem.setScale(p.entityId, scale, scale);
            Text2DSystem.replaceRangeWithSpaces(dialogueEntityId, p.index, p.length, TextTokenHelper.getSpaceWidth(size.width, scale));
            Container2DSystem.showContainer(p.entityId);
            SpriteSystem.play(p.entityId, p.name);
        }
    }
}