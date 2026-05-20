import Phaser from 'phaser';
import BoardScene from './scenes/BoardScene';

export default class GameEngine {
  constructor(container, initialState = {}) {
    this.game = new Phaser.Game({
      type: Phaser.AUTO,
      width: 876,
      height: 540,
      parent: container,
      backgroundColor: '#f0f9ff',
      scene: [BoardScene],
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
    });

    this.game.registry.set('gameState', initialState);
  }

  /** Push current React game-state into Phaser's stats panel */
  syncState(state) {
    this.game.events.emit('sync-state', state);
  }

  /** Animate the player moving `steps` tiles */
  movePlayer(steps) {
    this.game.events.emit('do-move', steps);
  }

  /** Listen for Phaser → React events */
  on(event, cb) {
    this.game.events.on(event, cb);
  }

  destroy() {
    this.game?.destroy(true);
  }
}
