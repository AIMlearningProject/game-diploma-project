import prisma from '../services/prisma.js';
import { cache } from '../services/redis.js';
import { authenticate } from '../middleware/auth.js';

export default async function bookRoutes(fastify, options) {
  // Search books
  fastify.get('/search', {
    preHandler: authenticate,
  }, async (request, reply) => {
    const {
      q,
      genre,
      minAge,
      maxAge,
      difficulty,
      limit = 20,
      offset = 0,
    } = request.query;

    const where = {};

    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { author: { contains: q, mode: 'insensitive' } },
      ];
    }

    if (genre) {
      where.genre = genre;
    }

    if (minAge) {
      where.recommendedAgeMin = { gte: parseInt(minAge) };
    }

    if (maxAge) {
      where.recommendedAgeMax = { lte: parseInt(maxAge) };
    }

    if (difficulty) {
      where.difficultyScore = { gte: parseFloat(difficulty) };
    }

    const books = await prisma.book.findMany({
      where,
      take: parseInt(limit),
      skip: parseInt(offset),
      orderBy: { title: 'asc' },
    });

    const total = await prisma.book.count({ where });

    return {
      books,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
      },
    };
  });

  // Get book by ID
  fastify.get('/:id', {
    preHandler: authenticate,
  }, async (request, reply) => {
    const { id } = request.params;

    const book = await prisma.book.findUnique({
      where: { id },
    });

    if (!book) {
      return reply.status(404).send({ error: 'Book not found' });
    }

    return book;
  });

  // Get book recommendations for student
  fastify.get('/recommendations', {
    preHandler: authenticate,
  }, async (request, reply) => {
    const { studentId } = request.query;

    if (!studentId) {
      return reply.status(400).send({ error: 'studentId required' });
    }

    const cacheKey = `recommendations:${studentId}`;
    const cached = await cache.get(cacheKey);

    if (cached) {
      return cached;
    }

    // Get student profile
    const student = await prisma.studentProfile.findUnique({
      where: { studentId },
    });

    if (!student) {
      return reply.status(404).send({ error: 'Student not found' });
    }

    // Get reading history
    const readingHistory = await prisma.readingLog.findMany({
      where: { studentId },
      include: { book: true },
    });

    const readBookIds = readingHistory.map(log => log.book.id);
    const favoriteGenres = {};

    readingHistory.forEach(log => {
      favoriteGenres[log.book.genre] = (favoriteGenres[log.book.genre] || 0) + 1;
    });

    const topGenres = Object.entries(favoriteGenres)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([genre]) => genre);

    // Find recommendations
    const recommendations = await prisma.book.findMany({
      where: {
        id: { notIn: readBookIds },
        genre: topGenres.length > 0 ? { in: topGenres } : undefined,
        recommendedAgeMin: { lte: student.gradeLevel },
        recommendedAgeMax: { gte: student.gradeLevel },
      },
      take: 10,
      orderBy: { difficultyScore: 'asc' },
    });

    await cache.set(cacheKey, recommendations, 1800);

    return recommendations;
  });

  // Get all genres
  fastify.get('/genres', async (request, reply) => {
    const cacheKey = 'genres:all';
    const cached = await cache.get(cacheKey);

    if (cached) {
      return cached;
    }

    const genres = await prisma.book.findMany({
      select: { genre: true },
      distinct: ['genre'],
    });

    const genreList = genres.map(g => g.genre).sort();

    await cache.set(cacheKey, genreList, 3600);

    return genreList;
  });
}
