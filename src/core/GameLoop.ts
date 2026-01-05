import Particle2DSystem from '../systems/Particle2DSystem';
import Stage2DSystem from '../systems/Stage2DSystem';
import Transform2DSystem from '../systems/Transform2DSystem';
import FPSSystem from '../systems/FPSSystem';

export default class GameLoop {
   static lastTimestamp: number = 0;
  static deltaTime: number = 0;

  private static updateBound = GameLoop.update.bind(GameLoop);

  static start(): void {
    GameLoop.deltaTime = 0;
    GameLoop.lastTimestamp = 0;
    requestAnimationFrame(GameLoop.updateBound);
  }

  static update(timestamp: number): void {
    if (!GameLoop.lastTimestamp) GameLoop.lastTimestamp = timestamp;

    GameLoop.deltaTime = (timestamp - GameLoop.lastTimestamp) / 1000;
    GameLoop.lastTimestamp = timestamp;

    // Update systems
    Stage2DSystem.update();
    Transform2DSystem.update();
    Particle2DSystem.update(GameLoop.deltaTime);
    FPSSystem.update();

    requestAnimationFrame(GameLoop.updateBound);
  }
}
