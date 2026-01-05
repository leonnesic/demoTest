import * as PIXI from 'pixi.js';
import Text2DSystem from './Text2DSystem';

export default class FPSSystem {
    /** Updates the FPS counter text each frame. */
    static update(deltaTime: number): void {
        const fps = Math.round(PIXI.Ticker.shared.FPS);
        Text2DSystem.setText('fpsMeter', fps);
    }
}