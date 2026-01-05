import { Assets } from 'pixi.js';
import Shape2DSystem from '../systems/Shape2DSystem';

export default class AssetLoaderDirector {
  /** Loads a bundle while updating the preloader progress bar. */
  static async loadBundle(bundleId: string): Promise<void> {
    const barSize = Shape2DSystem.getSize('preloaderBar');

    await Assets.loadBundle(bundleId, (progress: number) => {
      Shape2DSystem.setSize('preloaderBar', barSize.x * progress, barSize.y);
    });
  }
}