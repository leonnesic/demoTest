import Container2DSystem from '../systems/Container2DSystem';
import Text2DSystem from '../systems/Text2DSystem';
import EntityManager from '../core/EntityManager';
import Transform2DSystem from '../systems/Transform2DSystem';

export default class DialogueDirector {
  /** Builds dialogue entities from the payload data. */
  static async build(payload: any): Promise<string[]> {
    const entityIds: string[] = [];

    for (const [i, dialogue] of payload.dialogue.entries()) {
      const id = `dialogue_${i}`;

      await EntityManager.createEntity('dialogues', id);
      Container2DSystem.showContainer(id);

      Text2DSystem.setText(id, dialogue.text);

      Transform2DSystem.setPosition(id, { x: -500, y: 400 - i * 50 });

      entityIds.push(id);
    }

    return entityIds;
  }
}