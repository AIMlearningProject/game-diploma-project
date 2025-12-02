/**
 * Game Logic Service - Server-authoritative game mechanics
 * All game calculations happen here to prevent client-side cheating
 */

import prisma from './prisma.js';

const FORMULA_VERSION = '1.0';

/**
 * Calculate steps and XP awarded for reading a book
 * @param {Object} params - Calculation parameters
 * @returns {Object} - { steps, xp, achievements }
 */
export async function calculateReward(params) {
  const {
    bookId,
    studentId,
    pagesRead,
  } = params;

  // Get book details
  const book = await prisma.book.findUnique({
    where: { id: bookId },
  });

  if (!book) {
    throw new Error('Book not found');
  }

  // Get student profile and game state
  const student = await prisma.studentProfile.findUnique({
    where: { studentId },
  });

  const gameState = await prisma.gameState.findUnique({
    where: { studentId },
  });

  if (!student || !gameState) {
    throw new Error('Student profile or game state not found');
  }

  // Get student's reading history for additional bonuses
  const readingHistory = await prisma.readingLog.findMany({
    where: { studentId },
    include: { book: true },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  // Base calculation
  const baseSteps = Math.floor(pagesRead / 10); // 1 step per 10 pages

  // Difficulty multiplier (0.5x to 2.0x)
  const difficultyMultiplier = Math.min(Math.max(book.difficultyScore, 0.5), 2.0);

  // Grade level bonus - books at or above student's level get bonus
  const gradeBonus = book.recommendedAgeMin >= student.gradeLevel ? 1.2 : 1.0;

  // Streak bonus
  const streakBonus = 1 + (gameState.streak * 0.05); // 5% per streak day, max 50%
  const cappedStreakBonus = Math.min(streakBonus, 1.5);

  // Genre diversity bonus
  const genres = new Set(readingHistory.map(log => log.book.genre));
  const diversityBonus = 1 + (genres.size * 0.1); // 10% per unique genre
  const cappedDiversityBonus = Math.min(diversityBonus, 1.5);

  // Calculate final steps
  const steps = Math.floor(
    baseSteps *
    difficultyMultiplier *
    gradeBonus *
    cappedStreakBonus *
    cappedDiversityBonus
  );

  // Calculate XP (different formula, more generous)
  const baseXp = pagesRead * 2;
  const xp = Math.floor(
    baseXp *
    difficultyMultiplier *
    gradeBonus *
    (1 + gameState.streak * 0.1)
  );

  // Check for achievements
  const newAchievements = await checkAchievements(studentId, {
    readingHistory,
    gameState,
    newBook: book,
  });

  return {
    steps,
    xp,
    achievements: newAchievements,
    bonuses: {
      difficulty: difficultyMultiplier,
      grade: gradeBonus,
      streak: cappedStreakBonus,
      diversity: cappedDiversityBonus,
    },
    formulaVersion: FORMULA_VERSION,
  };
}

/**
 * Check if student unlocked any achievements
 */
async function checkAchievements(studentId, context) {
  const { readingHistory, gameState, newBook } = context;

  const achievements = await prisma.achievement.findMany();
  const unlocked = [];

  for (const achievement of achievements) {
    // Skip if already unlocked
    if (gameState.unlockedAchievements.includes(achievement.id)) {
      continue;
    }

    const criteria = JSON.parse(achievement.criteriaJson);

    if (await meetsAchievementCriteria(criteria, {
      studentId,
      readingHistory,
      gameState,
      newBook,
    })) {
      unlocked.push(achievement);
    }
  }

  return unlocked;
}

/**
 * Check if specific achievement criteria are met
 */
async function meetsAchievementCriteria(criteria, context) {
  const { studentId, readingHistory, gameState, newBook } = context;

  // Example criteria checks
  if (criteria.books_in_7_days) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentBooks = readingHistory.filter(
      log => new Date(log.createdAt) > sevenDaysAgo
    );

    if (recentBooks.length < criteria.books_in_7_days) {
      return false;
    }
  }

  if (criteria.total_books) {
    const totalBooks = await prisma.readingLog.count({
      where: { studentId, verifiedByTeacher: true },
    });

    if (totalBooks < criteria.total_books) {
      return false;
    }
  }

  if (criteria.streak_days) {
    if (gameState.streak < criteria.streak_days) {
      return false;
    }
  }

  if (criteria.unique_genres) {
    const genres = new Set(readingHistory.map(log => log.book.genre));
    if (genres.size < criteria.unique_genres) {
      return false;
    }
  }

  if (criteria.total_pages) {
    const totalPages = readingHistory.reduce((sum, log) => sum + log.pagesRead, 0);
    if (totalPages < criteria.total_pages) {
      return false;
    }
  }

  if (criteria.difficulty_min) {
    const avgDifficulty = readingHistory.reduce((sum, log) => sum + log.book.difficultyScore, 0) / readingHistory.length;
    if (avgDifficulty < criteria.difficulty_min) {
      return false;
    }
  }

  return true;
}

/**
 * Update streak based on last activity
 */
export async function updateStreak(studentId) {
  const gameState = await prisma.gameState.findUnique({
    where: { studentId },
  });

  if (!gameState || !gameState.lastBookLoggedAt) {
    return gameState;
  }

  const now = new Date();
  const lastLog = new Date(gameState.lastBookLoggedAt);
  const hoursSinceLastLog = (now - lastLog) / (1000 * 60 * 60);

  let newStreak = gameState.streak;

  // If logged within 48 hours, increment streak
  if (hoursSinceLastLog <= 48) {
    newStreak += 1;
  } else {
    // Streak broken
    newStreak = 1;
  }

  const updatedGameState = await prisma.gameState.update({
    where: { studentId },
    data: {
      streak: newStreak,
      longestStreak: Math.max(newStreak, gameState.longestStreak),
      lastBookLoggedAt: now,
    },
  });

  return updatedGameState;
}

/**
 * Generate adaptive board configuration for a student
 */
export async function generateBoardConfig(studentId) {
  const student = await prisma.studentProfile.findUnique({
    where: { studentId },
  });

  const gameState = await prisma.gameState.findUnique({
    where: { studentId },
  });

  if (!student || !gameState) {
    throw new Error('Student not found');
  }

  // Get reading history to analyze patterns
  const readingHistory = await prisma.readingLog.findMany({
    where: { studentId, verifiedByTeacher: true },
    include: { book: true },
    orderBy: { createdAt: 'desc' },
  });

  const totalBooks = readingHistory.length;
  const avgDifficulty = totalBooks > 0
    ? readingHistory.reduce((sum, log) => sum + log.book.difficultyScore, 0) / totalBooks
    : 1.0;

  const genres = new Set(readingHistory.map(log => log.book.genre));

  // Board parameters adapt to student performance
  const boardLength = 50 + (student.gradeLevel * 10); // Longer boards for older students
  const bonusTileFrequency = Math.max(5, 10 - Math.floor(gameState.streak / 5)); // More bonuses for low streaks
  const genreGateFrequency = genres.size < 3 ? 7 : 15; // More genre gates if low diversity

  const tiles = [];

  for (let i = 0; i < boardLength; i++) {
    let tileType = 'normal';

    if (i === 0) {
      tileType = 'start';
    } else if (i === boardLength - 1) {
      tileType = 'diploma';
    } else if (i % bonusTileFrequency === 0) {
      tileType = 'bonus';
    } else if (i % genreGateFrequency === 0) {
      tileType = 'genre_gate';
    } else if (i % 10 === 0) {
      tileType = 'checkpoint';
    } else if (Math.random() < 0.1) {
      tileType = 'challenge';
    }

    tiles.push({
      position: i,
      type: tileType,
      theme: getThemeForGrade(student.gradeLevel),
    });
  }

  return {
    version: FORMULA_VERSION,
    studentId,
    tiles,
    metadata: {
      boardLength,
      studentGrade: student.gradeLevel,
      avgDifficulty,
      genreDiversity: genres.size,
      streak: gameState.streak,
    },
  };
}

/**
 * Get board theme based on grade level
 */
function getThemeForGrade(gradeLevel) {
  if (gradeLevel <= 3) return 'forest';
  if (gradeLevel <= 6) return 'ocean';
  if (gradeLevel <= 9) return 'space';
  return 'mountain';
}

/**
 * Validate board movement (anti-cheat)
 */
export async function validateMovement(studentId, claimedPosition, claimedSteps) {
  const gameState = await prisma.gameState.findUnique({
    where: { studentId },
  });

  if (!gameState) {
    throw new Error('Game state not found');
  }

  const expectedPosition = gameState.boardPosition + claimedSteps;

  if (claimedPosition !== expectedPosition) {
    // Log suspicious activity
    await prisma.auditLog.create({
      data: {
        actorId: studentId,
        action: 'SUSPICIOUS_MOVEMENT',
        target: `GameState:${gameState.id}`,
        metadataJson: JSON.stringify({
          claimedPosition,
          expectedPosition,
          claimedSteps,
          currentPosition: gameState.boardPosition,
        }),
      },
    });

    return {
      valid: false,
      message: 'Invalid movement detected',
    };
  }

  return {
    valid: true,
    newPosition: expectedPosition,
  };
}
