import prisma from '../services/prisma.js';
import { canAccessStudent } from '../middleware/auth.js';
import { calculateReward, updateStreak } from '../services/gameLogic.js';
import crypto from 'crypto';

export default async function studentRoutes(fastify, options) {
  // Get student state (returns just game state)
  fastify.get('/:id/state', {
    preHandler: canAccessStudent,
  }, async (request, reply) => {
    const { id } = request.params;

    const gameState = await prisma.gameState.findUnique({
      where: { studentId: id },
    });

    if (!gameState) {
      return reply.status(404).send({ error: 'Game state not found' });
    }

    return gameState;
  });

  // Get student profile (full profile with state)
  fastify.get('/:id/profile', {
    preHandler: canAccessStudent,
  }, async (request, reply) => {
    const { id } = request.params;

    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        studentProfile: {
          include: {
            class: {
              include: {
                teacher: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
        gameState: true,
      },
    });

    if (!user) {
      return reply.status(404).send({ error: 'Student not found' });
    }

    return {
      user: {
        id: user.id,
        name: user.name,
        profilePicture: user.profilePicture,
      },
      profile: user.studentProfile,
      gameState: user.gameState,
    };
  });

  // Log a book (alternative route for compatibility)
  fastify.post('/:id/books', {
    preHandler: canAccessStudent,
  }, async (request, reply) => {
    const { id } = request.params;
    const { bookId, pagesRead, review, reviewText, rating } = request.body;

    const reviewContent = review || reviewText;

    if (!bookId || !pagesRead) {
      return reply.status(400).send({ error: 'bookId and pagesRead required' });
    }

    // Validate rating if provided
    if (rating && (rating < 1 || rating > 5)) {
      return reply.status(400).send({ error: 'Rating must be between 1 and 5' });
    }

    // Validate pages read is positive
    if (pagesRead < 0) {
      return reply.status(400).send({ error: 'Pages read must be positive' });
    }

    // Validate book exists
    const book = await prisma.book.findUnique({
      where: { id: bookId },
    });

    if (!book) {
      return reply.status(404).send({ error: 'Book not found' });
    }

    // Validate pages read
    if (pagesRead > book.pages * 1.5) {
      return reply.status(400).send({
        error: 'Pages read exceeds reasonable book length',
        message: `This book has ${book.pages} pages`,
      });
    }

    // Calculate metadata hash for tamper detection
    const metadataHash = crypto
      .createHash('sha256')
      .update(`${id}:${bookId}:${pagesRead}:${Date.now()}`)
      .digest('hex');

    // Create reading log
    const readingLog = await prisma.readingLog.create({
      data: {
        studentId: id,
        bookId,
        pagesRead,
        reviewText: reviewContent,
        metadataHash,
        verifiedByTeacher: false,
      },
    });

    // Calculate rewards
    const reward = await calculateReward({
      bookId,
      studentId: id,
      pagesRead,
    });

    // Update game state
    const gameState = await prisma.gameState.findUnique({
      where: { studentId: id },
    });

    const updatedGameState = await prisma.gameState.update({
      where: { studentId: id },
      data: {
        boardPosition: gameState.boardPosition + reward.steps,
        xp: gameState.xp + reward.xp,
        level: Math.floor((gameState.xp + reward.xp) / 1000) + 1,
        unlockedAchievements: [
          ...gameState.unlockedAchievements,
          ...reward.achievements.map(a => a.id),
        ],
        lastUpdate: new Date(),
      },
    });

    // Update reading log with awarded points
    await prisma.readingLog.update({
      where: { id: readingLog.id },
      data: {
        pointsAwarded: reward.xp,
        stepsAwarded: reward.steps,
      },
    });

    // Update streak
    await updateStreak(id);

    return {
      id: readingLog.id,
      readingLog,
      reward,
      gameState: updatedGameState,
      achievements: reward.achievements,
    };
  });

  // Log a book (original route)
  fastify.post('/:id/log-book', {
    preHandler: canAccessStudent,
  }, async (request, reply) => {
    const { id } = request.params;
    const { bookId, pagesRead, reviewText, finishDate } = request.body;

    if (!bookId || !pagesRead) {
      return reply.status(400).send({ error: 'bookId and pagesRead required' });
    }

    // Validate book exists
    const book = await prisma.book.findUnique({
      where: { id: bookId },
    });

    if (!book) {
      return reply.status(404).send({ error: 'Book not found' });
    }

    // Validate pages read
    if (pagesRead > book.pages * 1.1) {
      return reply.status(400).send({
        error: 'Pages read exceeds book length',
        message: `This book has ${book.pages} pages, but you claimed ${pagesRead} pages`,
      });
    }

    // Validate review length (anti-cheat)
    if (reviewText && reviewText.length < 20) {
      return reply.status(400).send({
        error: 'Review too short',
        message: 'Please write at least 20 characters about the book',
      });
    }

    // Calculate metadata hash for tamper detection
    const metadataHash = crypto
      .createHash('sha256')
      .update(`${id}:${bookId}:${pagesRead}:${Date.now()}`)
      .digest('hex');

    // Create reading log
    const readingLog = await prisma.readingLog.create({
      data: {
        studentId: id,
        bookId,
        pagesRead,
        reviewText,
        finishDate: finishDate ? new Date(finishDate) : new Date(),
        metadataHash,
        verifiedByTeacher: false,
      },
    });

    // Calculate rewards
    const reward = await calculateReward({
      bookId,
      studentId: id,
      pagesRead,
    });

    // Update game state
    const gameState = await prisma.gameState.findUnique({
      where: { studentId: id },
    });

    const updatedGameState = await prisma.gameState.update({
      where: { studentId: id },
      data: {
        boardPosition: gameState.boardPosition + reward.steps,
        xp: gameState.xp + reward.xp,
        level: Math.floor((gameState.xp + reward.xp) / 1000) + 1,
        unlockedAchievements: [
          ...gameState.unlockedAchievements,
          ...reward.achievements.map(a => a.id),
        ],
        lastUpdate: new Date(),
      },
    });

    // Update reading log with awarded points
    await prisma.readingLog.update({
      where: { id: readingLog.id },
      data: {
        pointsAwarded: reward.xp,
        stepsAwarded: reward.steps,
      },
    });

    // Update streak
    await updateStreak(id);

    return {
      readingLog,
      reward,
      gameState: updatedGameState,
      achievements: reward.achievements,
    };
  });

  // Get reading history (books endpoint for compatibility)
  fastify.get('/:id/books', {
    preHandler: canAccessStudent,
  }, async (request, reply) => {
    const { id } = request.params;
    const { limit = 20, offset = 0 } = request.query;

    const logs = await prisma.readingLog.findMany({
      where: { studentId: id },
      include: {
        book: true,
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset),
    });

    return logs;
  });

  // Get reading history
  fastify.get('/:id/history', {
    preHandler: canAccessStudent,
  }, async (request, reply) => {
    const { id } = request.params;
    const { limit = 20, offset = 0 } = request.query;

    const logs = await prisma.readingLog.findMany({
      where: { studentId: id },
      include: {
        book: true,
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset),
    });

    const total = await prisma.readingLog.count({
      where: { studentId: id },
    });

    return {
      logs,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
      },
    };
  });

  // Get student statistics
  fastify.get('/:id/stats', {
    preHandler: canAccessStudent,
  }, async (request, reply) => {
    const { id } = request.params;

    const logs = await prisma.readingLog.findMany({
      where: { studentId: id, verifiedByTeacher: true },
      include: { book: true },
    });

    const totalBooksRead = logs.length;
    const totalPagesRead = logs.reduce((sum, log) => sum + log.pagesRead, 0);

    const genreCount = {};
    logs.forEach(log => {
      genreCount[log.book.genre] = (genreCount[log.book.genre] || 0) + 1;
    });

    const gameState = await prisma.gameState.findUnique({
      where: { studentId: id },
    });

    return {
      totalBooksRead,
      totalPagesRead,
      genreDistribution: genreCount,
      currentStreak: gameState?.streak || 0,
      longestStreak: gameState?.longestStreak || 0,
      xp: gameState?.xp || 0,
      level: gameState?.level || 1,
      boardPosition: gameState?.boardPosition || 0,
    };
  });

  // Get achievements
  fastify.get('/:id/achievements', {
    preHandler: canAccessStudent,
  }, async (request, reply) => {
    const { id } = request.params;

    const gameState = await prisma.gameState.findUnique({
      where: { studentId: id },
    });

    if (!gameState) {
      return reply.status(404).send({ error: 'Game state not found' });
    }

    const achievements = await prisma.achievement.findMany({
      where: {
        id: {
          in: gameState.unlockedAchievements,
        },
      },
    });

    const allAchievements = await prisma.achievement.findMany();

    return {
      unlocked: achievements,
      total: allAchievements.length,
      locked: allAchievements.filter(
        a => !gameState.unlockedAchievements.includes(a.id)
      ),
    };
  });
}
