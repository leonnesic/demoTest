import UISystem from '../systems/UISystem';
import Container2DSystem from '../systems/Container2DSystem';
import Stage2DSystem from '../systems/Stage2DSystem';
import SpriteSystem from '../systems/SpriteSystem';
import Camera2DSystem from '../systems/Camera2DSystem';
import Tween2DSystem from '../systems/Tween2DSystem';
import Shape2DSystem from '../systems/Shape2DSystem';
import Text2DSystem from '../systems/Text2DSystem';
import Particle2DSystem from '../systems/Particle2DSystem';
import GameFlow from '../flow/GameFlow';
import PreloaderFlow from '../flow/PreloaderFlow';
import GameLoop from './GameLoop';

export default class Game {
    /** Boots rendering and flow systems before game start. */
    static async init(): Promise < void > {
        await Stage2DSystem.init();
        await Camera2DSystem.init();

        Container2DSystem.init();
        SpriteSystem.init();
        Shape2DSystem.init();
        UISystem.init();
        Tween2DSystem.init();
        Text2DSystem.init();
        Particle2DSystem.init();

        GameLoop.start();
        await PreloaderFlow.init();
        await GameFlow.init('game');
    }
}