import {
    Assets
} from 'pixi.js';
import Sequencer from '../core/Sequencer';
import SceneBuilder from '../utils/SceneBuilder';
import GameData from '../core/GameData';
import Container2DSystem from '../systems/Container2DSystem';

export default class PreloaderFlow {
    /** Boots the preloader sequence and stage-specific assets. */
    static async init(): Promise < void > {
        const sequence = new Sequencer({
            debug: true
        });
        sequence
        .add(PreloaderFlow.initManifest)
        .add(PreloaderFlow.loadBundle, 'preloader')
        .add(PreloaderFlow.buildScene, 'preloaderScene')
        .add(PreloaderFlow.applyProperties, 'preloaderScene')
        .add(PreloaderFlow.showGroup, 'preloader')

        await sequence.run();
    }

    /** Builds the asset manifest before bundle loads. */
    static async initManifest(): Promise < void > {
        const manifest = await GameData.buildManifest();
        await Assets.init({
            manifest
        });
    }

    /** Loads the requested asset bundle while reporting its progress. */
    static async loadBundle(bundleId: string): Promise < void > {
        await Assets.loadBundle(bundleId, (progress: number) => console.log('Progress:', progress));
    }

    /** Constructs the scene entities prior to applying props. */
    static async buildScene(sceneId: string): Promise < void > {
        await SceneBuilder.build(sceneId);
    }

    /** Applies static scene properties and shows preloader containers. */
    static async applyProperties(sceneId: string): Promise < void > {
        Container2DSystem.showGroup('preloader');
        await SceneBuilder.applyProperties(sceneId);
    }

    /** Makes the requested container group visible. */
    static showGroup(groupId: string): void {
        Container2DSystem.showGroup(groupId);
    }
}