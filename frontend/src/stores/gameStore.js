import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { calculateReward, computeStreak, xpToLevel, checkAchievements } from '../utils/gameLogic';

const BOARD_LENGTH = 50;

export const useGameStore = create(
  persist(
    (set, get) => ({
      // ── Game state ─────────────────────────────────────────────
      boardPosition: 0,
      xp: 0,
      level: 1,
      streak: 0,
      longestStreak: 0,
      lastLoggedAt: null,
      unlockedAchievements: [],
      readingHistory: [],

      // ── Pending animation (cleared after Phaser consumes it) ──
      pendingSteps: 0,
      lastReward: null, // { steps, xp, achievements[] }

      // ── Core action ───────────────────────────────────────────
      logBook(book) {
        const s = get();

        // Streak
        const { newStreak } = computeStreak(s.lastLoggedAt, s.streak);

        // Genre diversity
        const genreSet = new Set(s.readingHistory.map(b => b.genre));
        genreSet.add(book.genre);
        const genreCount = genreSet.size;

        // Reward
        const { steps, xp, bonuses } = calculateReward({
          pages: book.pages,
          difficulty: book.difficulty,
          streak: newStreak,
          genreCount,
        });

        // New state
        const newPosition = Math.min(s.boardPosition + steps, BOARD_LENGTH - 1);
        const newXp = s.xp + xp;
        const newLevel = xpToLevel(newXp);
        const newHistory = [
          { ...book, loggedAt: new Date().toISOString(), steps, xp },
          ...s.readingHistory,
        ];

        // Achievements
        const newAchievements = checkAchievements(s.unlockedAchievements, {
          readingHistory: newHistory,
          streak: newStreak,
          boardPosition: newPosition,
        });

        set({
          boardPosition: newPosition,
          xp: newXp,
          level: newLevel,
          streak: newStreak,
          longestStreak: Math.max(newStreak, s.longestStreak),
          lastLoggedAt: new Date().toISOString(),
          unlockedAchievements: [...s.unlockedAchievements, ...newAchievements.map(a => a.id)],
          readingHistory: newHistory,
          pendingSteps: steps,
          lastReward: { steps, xp, bonuses, achievements: newAchievements },
        });

        return { steps, xp, bonuses, achievements: newAchievements };
      },

      clearPendingSteps() {
        set({ pendingSteps: 0 });
      },

      resetGame() {
        set({
          boardPosition: 0,
          xp: 0,
          level: 1,
          streak: 0,
          longestStreak: 0,
          lastLoggedAt: null,
          unlockedAchievements: [],
          readingHistory: [],
          pendingSteps: 0,
          lastReward: null,
        });
      },

      // ── Derived helpers (call as functions) ──────────────────
      get totalPages() {
        return get().readingHistory.reduce((s, b) => s + (b.pages || 0), 0);
      },
      get totalBooks() {
        return get().readingHistory.length;
      },
      get uniqueGenres() {
        return new Set(get().readingHistory.map(b => b.genre)).size;
      },
      get progressPct() {
        return Math.round((get().boardPosition / (BOARD_LENGTH - 1)) * 100);
      },
    }),
    { name: 'lukudiplomi-game-v1' }
  )
);
