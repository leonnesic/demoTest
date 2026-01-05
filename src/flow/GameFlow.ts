import Sequencer from '../core/Sequencer';
import AssetLoaderDirector from '../directors/AssetLoaderDirector';
import SceneDirector from '../directors/SceneDirector';
import UIDirector from '../directors/UIDirector';
import FPSDirector from '../directors/FPSDirector';
import GameLoop from '../core/GameLoop';
import { UIActions } from '../scenarios/UIActions';
import MagicWordsDirector from '../directors/MagicWordsDirector';

export default class GameFlow {
    /** Sequences bundle loading, scene prep, and director init. */
    static async init(bundleId: string): Promise < void > {
        const sequence = new Sequencer();
        sequence
        .add(AssetLoaderDirector.loadBundle, bundleId)
        .add(GameLoop.start)        
        .add(SceneDirector.build, 'gameScene')
        .add(SceneDirector.applyProperties, 'gameScene')
        .add(SceneDirector.hideGroup, 'preloader')
        .add(SceneDirector.showGroup, 'game')
        .add(MagicWordsDirector.init)
        .add(FPSDirector.init)
        .add(UIDirector.init)
        .add(UIDirector.onIntent, GameFlow.handleUI)
        await sequence.run();
    }

    /** Routes UI intents to the mapped action handlers. */
    static handleUI(payload: string): void {
        const payloadType = payload.replace(/^button/, '').toLowerCase();
        UIActions[payloadType]?.();
    }
}