import prisma from '../services/prisma.js';
import { requireRole } from '../middleware/auth.js';
import { cache } from '../services/redis.js';

export default async function analyticsRoutes(fastify, options) {
  // Get class analytics
  fastify.get('/class/:id', {
    preHandler: requireRole(['TEACHER', 'ADMIN']),
  }, async (request, reply) => {
    const { id } = request.params;
    const { startDate, endDate } = request.query;

    const cacheKey = `analytics:class:${id}:${startDate}:${endDate}`;
    const cached = await cache.get(cacheKey);

    if (cached) {
      return cached;
    }

    // Get class with students
    const classData = await prisma.class.findUnique({
      where: { id },
      include: {
        students: {
          include: {
            student: {
              include: {
                gameState: true,
              },
            },
          },
        },
      },
    });

    if (!classData) {
      return reply.status(404).send({ error: 'Class not found' });
    }

    const studentIds = classData.students.map(s => s.studentId);

    // Build date filter
    const dateFilter = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    // Get reading logs
    const readingLogs = await prisma.readingLog.findMany({
      where: {
        studentId: { in: studentIds },
        ...(startDate || endDate ? { createdAt: dateFilter } : {}),
      },
      include: {
        book: true,
        student: true,
      },
    });

    // Calculate analytics
    const totalBooksRead = readingLogs.filter(log => log.verifiedByTeacher).length;
    const totalPagesRead = readingLogs.reduce((sum, log) => sum + log.pagesRead, 0);

    const genreDistribution = {};
    readingLogs.forEach(log => {
      genreDistribution[log.book.genre] = (genreDistribution[log.book.genre] || 0) + 1;
    });

    const avgDifficulty = readingLogs.length > 0
      ? readingLogs.reduce((sum, log) => sum + log.book.difficultyScore, 0) / readingLogs.length
      : 0;

    // Student performance
    const studentPerformance = classData.students.map(s => {
      const studentLogs = readingLogs.filter(log => log.studentId === s.studentId);
      return {
        id: s.student.id,
        name: s.student.name,
        booksRead: studentLogs.filter(log => log.verifiedByTeacher).length,
        pagesRead: studentLogs.reduce((sum, log) => sum + log.pagesRead, 0),
        streak: s.student.gameState?.streak || 0,
        xp: s.student.gameState?.xp || 0,
        level: s.student.gameState?.level || 1,
      };
    });

    // Activity timeline (books per week)
    const weeklyActivity = {};
    readingLogs.forEach(log => {
      const week = new Date(log.createdAt).toISOString().slice(0, 10);
      weeklyActivity[week] = (weeklyActivity[week] || 0) + 1;
    });

    const analytics = {
      classId: id,
      className: classData.name,
      totalStudents: classData.students.length,
      totalBooksRead,
      totalPagesRead,
      avgBooksPerStudent: (totalBooksRead / classData.students.length).toFixed(1),
      avgPagesPerStudent: (totalPagesRead / classData.students.length).toFixed(0),
      avgDifficulty: avgDifficulty.toFixed(2),
      genreDistribution,
      studentPerformance: studentPerformance.sort((a, b) => b.booksRead - a.booksRead),
      weeklyActivity: Object.entries(weeklyActivity)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date)),
    };

    await cache.set(cacheKey, analytics, 600);

    return analytics;
  });

  // Get student analytics
  fastify.get('/student/:id', {
    preHandler: requireRole(['STUDENT', 'TEACHER', 'ADMIN']),
  }, async (request, reply) => {
    const { id } = request.params;

    const cacheKey = `analytics:student:${id}`;
    const cached = await cache.get(cacheKey);

    if (cached) {
      return cached;
    }

    const readingLogs = await prisma.readingLog.findMany({
      where: { studentId: id },
      include: { book: true },
      orderBy: { createdAt: 'asc' },
    });

    const gameState = await prisma.gameState.findUnique({
      where: { studentId: id },
    });

    const totalBooks = readingLogs.filter(log => log.verifiedByTeacher).length;
    const totalPages = readingLogs.reduce((sum, log) => sum + log.pagesRead, 0);

    const genreDistribution = {};
    readingLogs.forEach(log => {
      genreDistribution[log.book.genre] = (genreDistribution[log.book.genre] || 0) + 1;
    });

    const difficultyProgression = readingLogs.map((log, index) => ({
      book: index + 1,
      difficulty: log.book.difficultyScore,
      date: log.createdAt,
    }));

    const analytics = {
      studentId: id,
      totalBooks,
      totalPages,
      currentStreak: gameState?.streak || 0,
      longestStreak: gameState?.longestStreak || 0,
      xp: gameState?.xp || 0,
      level: gameState?.level || 1,
      boardPosition: gameState?.boardPosition || 0,
      genreDistribution,
      difficultyProgression,
      achievements: gameState?.unlockedAchievements?.length || 0,
    };

    await cache.set(cacheKey, analytics, 600);

    return analytics;
  });
}
