import Phaser from 'phaser';
import api from '../../api/client';

class BoardScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BoardScene' });
    this.playerPosition = 0;
    this.tiles = [];
    this.player = null;
  }

  init() {
    this.studentId = this.registry.get('studentId');
  }

  preload() {
    // Create simple colored rectangles as placeholders for tiles
    this.createTileTextures();

    // Create simple player sprite
    this.createPlayerTexture();
  }

  create() {
    this.tiles = this.registry.get('tiles') || this.generateDefaultBoard();

    // Fetch current game state
    this.loadGameState();

    // Draw the board
    this.drawBoard();

    // Create player
    this.createPlayer();

    // Add UI
    this.createUI();
  }

  createTileTextures() {
    const tileTypes = {
      start: 0x22c55e,      // Green
      normal: 0xe5e7eb,     // Gray
      bonus: 0xfbbf24,      // Yellow
      genre_gate: 0x8b5cf6, // Purple
      checkpoint: 0x3b82f6, // Blue
      challenge: 0xef4444,  // Red
      diploma: 0xfbbf24,    // Gold
    };

    Object.entries(tileTypes).forEach(([type, color]) => {
      const graphics = this.add.graphics();
      graphics.fillStyle(color);
      graphics.fillRoundedRect(0, 0, 60, 60, 8);
      graphics.generateTexture(`tile_${type}`, 60, 60);
      graphics.destroy();
    });
  }

  createPlayerTexture() {
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff6b6b);
    graphics.fillCircle(20, 20, 20);
    graphics.generateTexture('player', 40, 40);
    graphics.destroy();
  }

  generateDefaultBoard() {
    const defaultTiles = [];
    for (let i = 0; i < 50; i++) {
      let type = 'normal';
      if (i === 0) type = 'start';
      else if (i === 49) type = 'diploma';
      else if (i % 10 === 0) type = 'checkpoint';
      else if (i % 5 === 0) type = 'bonus';

      defaultTiles.push({
        position: i,
        type,
        theme: 'forest',
      });
    }
    return defaultTiles;
  }

  async loadGameState() {
    try {
      const response = await api.get(`/students/${this.studentId}/state`);
      this.playerPosition = response.data.gameState?.boardPosition || 0;
      this.gameState = response.data.gameState;
    } catch (error) {
      console.error('Failed to load game state:', error);
      this.playerPosition = 0;
    }
  }

  drawBoard() {
    const tilesPerRow = 10;
    const tileSize = 60;
    const spacing = 10;
    const startX = 50;
    const startY = 50;

    this.tiles.forEach((tile, index) => {
      const row = Math.floor(index / tilesPerRow);
      const col = index % tilesPerRow;

      // Zigzag pattern
      const x = row % 2 === 0
        ? startX + col * (tileSize + spacing)
        : startX + (tilesPerRow - 1 - col) * (tileSize + spacing);

      const y = startY + row * (tileSize + spacing);

      const tileSprite = this.add.image(x, y, `tile_${tile.type}`);
      tileSprite.setOrigin(0, 0);

      // Add tile number
      this.add.text(x + tileSize / 2, y + tileSize / 2, `${index}`, {
        fontSize: '14px',
        color: '#000',
        fontStyle: 'bold',
      }).setOrigin(0.5);

      // Store position for player movement
      tile.x = x + tileSize / 2;
      tile.y = y + tileSize / 2;
    });
  }

  createPlayer() {
    const currentTile = this.tiles[this.playerPosition];

    if (currentTile) {
      this.player = this.add.image(currentTile.x, currentTile.y, 'player');
      this.player.setOrigin(0.5);
      this.player.setScale(0.8);

      // Bounce animation
      this.tweens.add({
        targets: this.player,
        y: currentTile.y - 10,
        duration: 500,
        yoyo: true,
        repeat: -1,
      });
    }
  }

  createUI() {
    const uiX = 650;
    const uiY = 50;

    // Background for UI
    const uiBackground = this.add.graphics();
    uiBackground.fillStyle(0xffffff, 0.9);
    uiBackground.fillRoundedRect(uiX - 10, uiY - 10, 140, 200, 8);

    this.add.text(uiX, uiY, 'Game Stats', {
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#000',
    });

    this.add.text(uiX, uiY + 40, `Position: ${this.playerPosition}`, {
      fontSize: '14px',
      color: '#000',
    });

    if (this.gameState) {
      this.add.text(uiX, uiY + 70, `XP: ${this.gameState.xp}`, {
        fontSize: '14px',
        color: '#000',
      });

      this.add.text(uiX, uiY + 100, `Level: ${this.gameState.level}`, {
        fontSize: '14px',
        color: '#000',
      });

      this.add.text(uiX, uiY + 130, `Streak: ${this.gameState.streak}`, {
        fontSize: '14px',
        color: '#000',
      });
    }
  }

  update() {
    // Game loop - can add animations, particle effects, etc.
  }
}

export default BoardScene;
