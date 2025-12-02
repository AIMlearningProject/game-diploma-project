import prisma from '../services/prisma.js';
import { requireRole } from '../middleware/auth.js';

export default async function adminRoutes(fastify, options) {
  // Get all users
  fastify.get('/users', {
    preHandler: requireRole(['ADMIN']),
  }, async (request, reply) => {
    const { role, limit = 50, offset = 0 } = request.query;

    const where = role ? { role } : {};

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        studentProfile: true,
      },
      take: parseInt(limit),
      skip: parseInt(offset),
      orderBy: { createdAt: 'desc' },
    });

    const total = await prisma.user.count({ where });

    return {
      users,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
      },
    };
  });

  // Import books from CSV/JSON
  fastify.post('/books/import', {
    preHandler: requireRole(['ADMIN']),
  }, async (request, reply) => {
    const { books } = request.body;

    if (!Array.isArray(books) || books.length === 0) {
      return reply.status(400).send({ error: 'books array required' });
    }

    const imported = [];
    const errors = [];

    for (const bookData of books) {
      try {
        const book = await prisma.book.create({
          data: {
            title: bookData.title,
            author: bookData.author,
            isbn: bookData.isbn,
            pages: parseInt(bookData.pages),
            genre: bookData.genre,
            difficultyScore: parseFloat(bookData.difficultyScore || 1.0),
            recommendedAgeMin: parseInt(bookData.recommendedAgeMin),
            recommendedAgeMax: parseInt(bookData.recommendedAgeMax),
            coverImage: bookData.coverImage,
          },
        });
        imported.push(book);
      } catch (err) {
        errors.push({
          book: bookData,
          error: err.message,
        });
      }
    }

    await prisma.auditLog.create({
      data: {
        actorId: request.user.id,
        action: 'IMPORT_BOOKS',
        target: 'Books',
        metadataJson: JSON.stringify({
          imported: imported.length,
          errors: errors.length,
        }),
      },
    });

    return {
      imported: imported.length,
      errors,
      books: imported,
    };
  });

  // Create achievement
  fastify.post('/achievements', {
    preHandler: requireRole(['ADMIN']),
  }, async (request, reply) => {
    const { key, name, description, icon, criteria, points, tier } = request.body;

    if (!key || !name || !description || !criteria) {
      return reply.status(400).send({ error: 'key, name, description, and criteria required' });
    }

    const achievement = await prisma.achievement.create({
      data: {
        key,
        name,
        description,
        icon: icon || '🏆',
        criteriaJson: JSON.stringify(criteria),
        points: parseInt(points) || 10,
        tier: tier || 'bronze',
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: request.user.id,
        action: 'CREATE_ACHIEVEMENT',
        target: `Achievement:${achievement.id}`,
        metadataJson: JSON.stringify({ key, name }),
      },
    });

    return achievement;
  });

  // Get audit logs
  fastify.get('/audit-logs', {
    preHandler: requireRole(['ADMIN']),
  }, async (request, reply) => {
    const { action, actorId, limit = 100, offset = 0 } = request.query;

    const where = {};
    if (action) where.action = action;
    if (actorId) where.actorId = actorId;

    const logs = await prisma.auditLog.findMany({
      where,
      include: {
        actor: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: parseInt(limit),
      skip: parseInt(offset),
    });

    const total = await prisma.auditLog.count({ where });

    return {
      logs,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
      },
    };
  });

  // Create board config
  fastify.post('/board-config', {
    preHandler: requireRole(['ADMIN']),
  }, async (request, reply) => {
    const { version, config, minAge, maxAge } = request.body;

    if (!version || !config) {
      return reply.status(400).send({ error: 'version and config required' });
    }

    const boardConfig = await prisma.boardConfig.create({
      data: {
        version,
        configJson: JSON.stringify(config),
        minAge: parseInt(minAge) || 6,
        maxAge: parseInt(maxAge) || 18,
        isActive: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: request.user.id,
        action: 'CREATE_BOARD_CONFIG',
        target: `BoardConfig:${boardConfig.id}`,
        metadataJson: JSON.stringify({ version }),
      },
    });

    return boardConfig;
  });
}
