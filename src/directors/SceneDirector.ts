import SceneBuilder from '../utils/SceneBuilder';
import Container2DSystem from '../systems/Container2DSystem';

export default class SceneDirector {
    /** Constructs the scene definition via SceneBuilder. */
    static async build(sceneId: string): Promise < void > {
        await SceneBuilder.build(sceneId);
    }

    /** Applies scene definition properties such as visibility and text. */
    static async applyProperties(sceneId: string): Promise < void > {
        await SceneBuilder.applyProperties(sceneId);
    }

    /** Shows the requested container group. */
    static showGroup(target) {
        Container2DSystem.showGroup([target]);
    }

    /** Hides the specified container group. */
    static hideGroup(target) {
        Container2DSystem.hideGroup(target);
    }

    /** Hides the specified container. */
    static hideContainer(target) {
        Container2DSystem.hideContainer(target);
    }
    /** Shows the specified container. */
    static showContainer(target) {
        Container2DSystem.showContainer(target);
    }
}