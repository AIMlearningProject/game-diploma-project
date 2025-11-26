import Phaser from 'phaser';
import BoardScene from './scenes/BoardScene';
import api from '../api/client';

class GameEngine {
  constructor(container, studentId) {
    this.studentId = studentId;
    this.container = container;

    const config = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      parent: container,
      backgroundColor: '#87CEEB',
      scene: [BoardScene],
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0 },
          debug: false,
        },
      },
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
    };

    this.game = new Phaser.Game(config);

    // Pass student ID to scene
    this.game.registry.set('studentId', studentId);

    // Fetch board config
    this.loadBoardConfig();
  }

  async loadBoardConfig() {
    try {
      const response = await api.get(`/game/board-config?studentId=${this.studentId}`);
      this.game.registry.set('boardConfig', response.data);
      this.game.registry.set('tiles', response.data.tiles);
    } catch (error) {
      console.error('Failed to load board config:', error);
    }
  }

  destroy() {
    if (this.game) {
      this.game.destroy(true);
    }
  }
}

export default GameEngine;
