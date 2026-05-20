import Phaser from 'phaser';

// Layout
const TILE_SIZE = 56;
const TILE_GAP  = 7;
const STEP      = TILE_SIZE + TILE_GAP;
const PER_ROW   = 10;
const START_X   = 22;
const START_Y   = 74;
const BOARD_LEN = 50;

const COLORS = {
  start:      0x22c55e,
  normal:     0xe2e8f0,
  bonus:      0xfbbf24,
  genre_gate: 0x8b5cf6,
  checkpoint: 0x3b82f6,
  challenge:  0xef4444,
  diploma:    0xf59e0b,
};

const ICONS = {
  start: '🚀', bonus: '⭐', genre_gate: '📚',
  checkpoint: '📍', challenge: '⚡', diploma: '🏆',
};

export default class BoardScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BoardScene' });
    this.tiles      = [];
    this.playerPos  = 0;
    this.player     = null;
    this.idleTween  = null;
    this.isMoving   = false;
    this.statsTexts = {};
    this.progressFill = null;
    this._pb        = {};
  }

  // ── lifecycle ─────────────────────────────────────────────────────────────
  preload() {
    this._buildTileTextures();
    this._buildPlayerTexture();
  }

  create() {
    this.tiles = this._buildBoard();
    this._drawBoard();
    this._createPlayer();
    this._createStatsPanel();
    this._createLegend();

    const saved = this.registry.get('gameState') || {};
    this.playerPos = Math.min(saved.position || 0, BOARD_LEN - 1);
    this._teleport(this.playerPos);
    this.syncStats(saved);

    this.game.events.on('do-move',    steps => this.beginMove(steps), this);
    this.game.events.on('sync-state', s     => this.syncStats(s),     this);
  }

  // ── board ─────────────────────────────────────────────────────────────────
  _buildBoard() {
    return Array.from({ length: BOARD_LEN }, (_, i) => {
      let type = 'normal';
      if      (i === 0)               type = 'start';
      else if (i === BOARD_LEN - 1)   type = 'diploma';
      else if (i % 10 === 0)          type = 'checkpoint';
      else if (i % 5  === 0)          type = 'bonus';
      else if ([13,27,41].includes(i)) type = 'genre_gate';
      else if ([18,33,45].includes(i)) type = 'challenge';

      const row    = Math.floor(i / PER_ROW);
      const col    = i % PER_ROW;
      const effCol = row % 2 === 0 ? col : PER_ROW - 1 - col;

      return {
        index: i, type,
        x: START_X + effCol * STEP + TILE_SIZE / 2,
        y: START_Y + row   * STEP + TILE_SIZE / 2,
      };
    });
  }

  _buildTileTextures() {
    Object.entries(COLORS).forEach(([type, color]) => {
      const g = this.add.graphics();
      g.fillStyle(color);
      g.fillRoundedRect(0, 0, TILE_SIZE, TILE_SIZE, 8);
      g.generateTexture(`tile_${type}`, TILE_SIZE, TILE_SIZE);
      g.destroy();
    });
  }

  _buildPlayerTexture() {
    const g = this.add.graphics();
    g.fillStyle(0x000000, 0.18);
    g.fillEllipse(18, 32, 26, 9);
    g.fillStyle(0xff6b6b);
    g.fillCircle(18, 16, 14);
    g.fillStyle(0xffffff);
    g.fillCircle(13, 12, 4);
    g.fillCircle(23, 12, 4);
    g.fillStyle(0x1e293b);
    g.fillCircle(14, 12, 2.5);
    g.fillCircle(24, 12, 2.5);
    g.lineStyle(2, 0x1e293b);
    g.beginPath();
    g.arc(18, 19, 5, 0.1, Math.PI - 0.1);
    g.strokePath();
    g.generateTexture('player', 36, 36);
    g.destroy();
  }

  _drawBoard() {
    this.tiles.forEach(t => {
      this.add.image(t.x - TILE_SIZE / 2, t.y - TILE_SIZE / 2, `tile_${t.type}`).setOrigin(0);
      this.add.text(t.x, t.y + 17, `${t.index}`, {
        fontSize: '9px',
        color: t.type === 'normal' ? '#6b7280' : '#fff',
        fontStyle: 'bold',
      }).setOrigin(0.5);
      if (ICONS[t.type]) {
        this.add.text(t.x, t.y - 7, ICONS[t.type], {
          fontSize: t.type === 'diploma' ? '20px' : '13px',
        }).setOrigin(0.5);
      }
    });
  }

  // ── player ────────────────────────────────────────────────────────────────
  _createPlayer() {
    const t = this.tiles[0];
    this.player = this.add.image(t.x, t.y, 'player').setDepth(10);
    this._idleBounce(t.y);
  }

  _idleBounce(baseY) {
    this.idleTween?.stop();
    this.idleTween = this.tweens.add({
      targets: this.player,
      y: baseY - 7,
      duration: 550,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  _teleport(pos) {
    const t = this.tiles[pos];
    if (!t || !this.player) return;
    this.player.setPosition(t.x, t.y);
    this._idleBounce(t.y);
  }

  // ── movement ──────────────────────────────────────────────────────────────
  beginMove(steps) {
    if (this.isMoving || steps <= 0) return;
    this.isMoving = true;
    this.idleTween?.stop();
    this._doStep(steps);
  }

  _doStep(remaining) {
    if (remaining <= 0 || this.playerPos >= BOARD_LEN - 1) {
      this._finishMove();
      return;
    }
    this.playerPos = Math.min(this.playerPos + 1, BOARD_LEN - 1);
    const t = this.tiles[this.playerPos];

    // Flash tile
    const flash = this.add.graphics().setDepth(6);
    flash.fillStyle(0xffffff, 0.5);
    flash.fillRoundedRect(t.x - TILE_SIZE / 2, t.y - TILE_SIZE / 2, TILE_SIZE, TILE_SIZE, 8);
    this.tweens.add({ targets: flash, alpha: 0, duration: 250, onComplete: () => flash.destroy() });

    // Hop
    this.tweens.add({
      targets: this.player,
      x: t.x,
      y: t.y - 14,
      duration: 140,
      ease: 'Quad.easeOut',
      onComplete: () => {
        this.tweens.add({
          targets: this.player,
          y: t.y,
          duration: 90,
          ease: 'Bounce.easeOut',
          onComplete: () => this.time.delayedCall(55, () => this._doStep(remaining - 1)),
        });
      },
    });
  }

  _finishMove() {
    this.isMoving = false;
    const t = this.tiles[this.playerPos];
    this._idleBounce(t.y);
    this._tileEffect(t);

    if (this.playerPos >= BOARD_LEN - 1) {
      this.time.delayedCall(900, () => this._showDiploma());
    } else {
      this.game.events.emit('move-complete', this.playerPos);
    }
  }

  // ── tile effects ─────────────────────────────────────────────────────────
  _tileEffect(tile) {
    const burst = (emoji, n = 6, r = 45) => {
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2;
        const em = this.add.text(tile.x, tile.y, emoji, { fontSize: '16px' }).setDepth(20).setAlpha(0);
        this.tweens.add({
          targets: em,
          x: tile.x + Math.cos(a) * r,
          y: tile.y + Math.sin(a) * r,
          alpha: { from: 1, to: 0 },
          duration: 650,
          onComplete: () => em.destroy(),
        });
      }
    };
    const toast = (text, bg) => {
      const m = this.add.text(tile.x, tile.y - 38, text, {
        fontSize: '13px', color: '#fff', backgroundColor: bg,
        padding: { x: 8, y: 4 },
      }).setOrigin(0.5).setDepth(20);
      this.tweens.add({ targets: m, y: m.y - 28, alpha: 0, duration: 1400, onComplete: () => m.destroy() });
    };

    if (tile.type === 'bonus')      { burst('⭐', 8, 50); toast('⭐ Bonus!', '#ca8a04'); }
    if (tile.type === 'checkpoint') { burst('📍', 5, 40); toast('📍 Tarkistuspiste!', '#2563eb'); }
    if (tile.type === 'genre_gate') { burst('📚', 6, 42); toast('📚 Kirjaportti!', '#7c3aed'); }
    if (tile.type === 'challenge')  {
      this.cameras.main.shake(280, 0.008);
      burst('⚡', 6, 40);
      toast('⚡ Haaste! Lue eri genre!', '#dc2626');
    }
  }

  // ── diploma ───────────────────────────────────────────────────────────────
  _showDiploma() {
    for (let i = 0; i < 24; i++) {
      this.time.delayedCall(i * 85, () => {
        const em = this.add.text(
          Phaser.Math.Between(60, 680),
          Phaser.Math.Between(30, 380),
          Phaser.Utils.Array.GetRandom(['🎆','✨','🎊','🎉','⭐','🏆']),
          { fontSize: '24px' }
        ).setDepth(30).setAlpha(0);
        this.tweens.add({ targets: em, alpha: 1, y: em.y - 50, duration: 480, yoyo: true, onComplete: () => em.destroy() });
      });
    }

    this.time.delayedCall(800, () => {
      const ov = this.add.graphics().setDepth(28);
      ov.fillStyle(0x000000, 0.55);
      ov.fillRect(0, 0, 880, 560);

      const bx = this.add.graphics().setDepth(29);
      bx.fillStyle(0xfef3c7);
      bx.fillRoundedRect(165, 130, 530, 290, 18);
      bx.lineStyle(4, 0xf59e0b);
      bx.strokeRoundedRect(165, 130, 530, 290, 18);

      [
        { y: 182, txt: '🏆  ONNITTELUT!  🏆',        style: { fontSize: '30px', fontStyle: 'bold', color: '#92400e' } },
        { y: 238, txt: 'Olet suorittanut\nLukudiplomin!', style: { fontSize: '22px', color: '#78350f', align: 'center' } },
        { y: 313, txt: '📚 Mahtavaa lukemista! 🎉',   style: { fontSize: '17px', color: '#92400e' } },
        { y: 355, txt: 'Klikkaa jatkaaksesi →',        style: { fontSize: '13px', color: '#b45309' } },
      ].forEach(({ y, txt, style }) => this.add.text(430, y, txt, style).setOrigin(0.5).setDepth(30));

      this.input.once('pointerdown', () => {
        ov.destroy(); bx.destroy();
        this.game.events.emit('diploma-reached');
      });
    });
  }

  // ── stats panel ───────────────────────────────────────────────────────────
  _createStatsPanel() {
    const px = 700, py = 60, pw = 162, ph = 250;

    const bg = this.add.graphics();
    bg.fillStyle(0x1e293b, 0.93);
    bg.fillRoundedRect(px, py, pw, ph, 12);

    this.add.text(px + pw / 2, py + 18, '📊  Tilastot', {
      fontSize: '13px', color: '#f1f5f9', fontStyle: 'bold',
    }).setOrigin(0.5);

    const row = (label, yOff) => {
      this.add.text(px + 12, py + yOff, label, { fontSize: '11px', color: '#94a3b8' });
      return this.add.text(px + pw - 12, py + yOff, '—', {
        fontSize: '12px', color: '#f1f5f9', fontStyle: 'bold',
      }).setOrigin(1, 0);
    };

    this.statsTexts = {
      position: row('Sijainti',  44),
      xp:       row('XP',        68),
      level:    row('Taso',       92),
      streak:   row('Putki',     116),
      books:    row('Kirjoja',   140),
      pages:    row('Sivuja',    164),
    };

    this.add.text(px + pw / 2, py + 196, 'Edistyminen', {
      fontSize: '10px', color: '#94a3b8',
    }).setOrigin(0.5);

    const bx = px + 12, by = py + 210, bw = pw - 24;
    const pbg = this.add.graphics();
    pbg.fillStyle(0x334155);
    pbg.fillRoundedRect(bx, by, bw, 12, 6);
    this.progressFill = this.add.graphics();
    this._pb = { bx, by, bw };
  }

  syncStats(s = {}) {
    const { position = 0, xp = 0, level = 1, streak = 0, books = 0, pages = 0 } = s;
    this.statsTexts.position?.setText(`${position} / 49`);
    this.statsTexts.xp?.setText(`${xp}`);
    this.statsTexts.level?.setText(`${level}`);
    this.statsTexts.streak?.setText(`${streak} pv`);
    this.statsTexts.books?.setText(`${books}`);
    this.statsTexts.pages?.setText(`${pages}`);

    const pct = Math.min(position / 49, 1);
    this.progressFill?.clear();
    const fw = Math.max(0, (this._pb.bw - 4) * pct);
    if (fw > 0) {
      this.progressFill.fillStyle(0x22d3ee);
      this.progressFill.fillRoundedRect(this._pb.bx + 2, this._pb.by + 2, fw, 8, 4);
    }
  }

  // ── legend ────────────────────────────────────────────────────────────────
  _createLegend() {
    [
      { c: 0x22c55e, l: 'Start' },
      { c: 0xfbbf24, l: 'Bonus' },
      { c: 0x3b82f6, l: 'Checkpoint' },
      { c: 0x8b5cf6, l: 'Kirjaportti' },
      { c: 0xef4444, l: 'Haaste' },
      { c: 0xf59e0b, l: '🏆 Diplomi' },
    ].forEach(({ c, l }, i) => {
      const x = 22 + i * 112, y = 516;
      const g = this.add.graphics();
      g.fillStyle(c);
      g.fillRoundedRect(x, y, 13, 13, 3);
      this.add.text(x + 17, y, l, { fontSize: '10px', color: '#374151' });
    });
  }
}
