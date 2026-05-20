// Client-side port of backend/src/services/gameLogic.js
// All calculations are deterministic — same inputs always yield same outputs.

const FORMULA_VERSION = '1.0';

export const ACHIEVEMENTS = [
  { id: 'first_book', name: 'Ensimmäinen kirja', icon: '📖', description: 'Kirjasit ensimmäisen kirjasi!', criteria: { total_books: 1 } },
  { id: 'five_books', name: 'Ahkera lukija', icon: '📚', description: 'Olet kirjannut 5 kirjaa', criteria: { total_books: 5 } },
  { id: 'ten_books', name: 'Kirjakettu', icon: '🦊', description: 'Olet kirjannut 10 kirjaa!', criteria: { total_books: 10 } },
  { id: 'streak_3', name: 'Lukuputki', icon: '🔥', description: '3 päivän lukuputki', criteria: { streak_days: 3 } },
  { id: 'streak_7', name: 'Viikon lukija', icon: '⚡', description: '7 päivän lukuputki!', criteria: { streak_days: 7 } },
  { id: 'genres_3', name: 'Monipuolinen lukija', icon: '🌈', description: 'Luettu 3 eri genreä', criteria: { unique_genres: 3 } },
  { id: 'genres_5', name: 'Kirjaseikkailija', icon: '🗺️', description: 'Luettu 5 eri genreä', criteria: { unique_genres: 5 } },
  { id: 'pages_500', name: '500 sivua!', icon: '🎯', description: 'Yhteensä 500 luettua sivua', criteria: { total_pages: 500 } },
  { id: 'pages_1000', name: 'Tuhat sivua!', icon: '🚀', description: 'Yhteensä 1000 luettua sivua', criteria: { total_pages: 1000 } },
  { id: 'diploma', name: 'Lukudiplomi', icon: '🏆', description: 'Saavutit lukudiplomin!', criteria: { board_position: 49 } },
];

/**
 * Calculate steps and XP for a logged book.
 */
export function calculateReward({ pages, difficulty, streak, genreCount }) {
  const baseSteps = Math.max(1, Math.floor(pages / 10));
  const diffMult = Math.min(Math.max(difficulty, 0.5), 2.0);
  const streakBonus = Math.min(1 + streak * 0.05, 1.5);
  const diversityBonus = Math.min(1 + genreCount * 0.1, 1.5);

  const steps = Math.max(1, Math.floor(baseSteps * diffMult * streakBonus * diversityBonus));
  const xp = Math.max(1, Math.floor(pages * 2 * diffMult * (1 + streak * 0.1)));

  return {
    steps,
    xp,
    bonuses: { difficulty: diffMult, streak: streakBonus, diversity: diversityBonus },
    formulaVersion: FORMULA_VERSION,
  };
}

/**
 * Compute new streak given the last log timestamp and current streak.
 * Returns { newStreak, streakBroken }.
 */
export function computeStreak(lastLoggedAt, currentStreak) {
  if (!lastLoggedAt) return { newStreak: 1, streakBroken: false };

  const now = Date.now();
  const last = new Date(lastLoggedAt).getTime();
  const hoursDiff = (now - last) / (1000 * 60 * 60);

  if (hoursDiff <= 48) {
    // Same or next day — extend streak
    return { newStreak: currentStreak + 1, streakBroken: false };
  }
  // Streak broken
  return { newStreak: 1, streakBroken: true };
}

/**
 * Compute level from total XP.
 * Level 1 at 0 XP, each level needs 100×level XP more.
 */
export function xpToLevel(xp) {
  let level = 1;
  let threshold = 100;
  let remaining = xp;
  while (remaining >= threshold) {
    remaining -= threshold;
    level++;
    threshold = 100 * level;
  }
  return level;
}

/**
 * Check which achievements are newly unlocked.
 * Returns array of achievement objects that weren't unlocked before.
 */
export function checkAchievements(alreadyUnlocked, { readingHistory, streak, boardPosition }) {
  const totalBooks = readingHistory.length;
  const totalPages = readingHistory.reduce((sum, b) => sum + (b.pages || 0), 0);
  const uniqueGenres = new Set(readingHistory.map(b => b.genre)).size;

  return ACHIEVEMENTS.filter(ach => {
    if (alreadyUnlocked.includes(ach.id)) return false;
    const c = ach.criteria;
    if (c.total_books && totalBooks < c.total_books) return false;
    if (c.streak_days && streak < c.streak_days) return false;
    if (c.unique_genres && uniqueGenres < c.unique_genres) return false;
    if (c.total_pages && totalPages < c.total_pages) return false;
    if (c.board_position !== undefined && boardPosition < c.board_position) return false;
    return true;
  });
}
