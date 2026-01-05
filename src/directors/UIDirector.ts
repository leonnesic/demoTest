import EventBus from '../utils/EventBus';
import UISystem from '../systems/UISystem';

export default class UIDirector {
  /** Hooks UI pointer events into the EventBus intent channel. */
  static init(): void {
    UISystem.on('pointerDown', ({ entityId }) => {
        EventBus.emit('game:intent', entityId);
    });
  }  
  /** Registers an intent handler for game-intent events. */
  static onIntent(handler: (payload: string) => void): void {
    EventBus.on('game:intent', handler);
  }
}
