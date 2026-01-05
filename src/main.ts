import Game from './core/Game';

/** Boots the demo by initializing all game systems. */
async function init(): Promise<void> {
  await Game.init();
}

init();