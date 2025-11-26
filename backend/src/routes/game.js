import { generateBoardConfig, validateMovement } from '../services/gameLogic.js';
import { cache } from '../services/redis.js';
import { authenticate } from '../middleware/auth.js';
import prisma from '../services/prisma.js';

export default async function gameRoutes(fastify, options) {
  // Get board configuration for student
  fastify.get('/board-config', {
    preHandler: authenticate,
  }, async (request, reply) => {
    const { studentId } = request.query;

    if (!studentId) {
      return reply.status(400).send({ error: 'studentId query parameter required' });
    }

    // Check cache first
    const cacheKey = `board:${studentId}`;
    const cached = await cache.get(cacheKey);

    if (cached) {
      return cached;
    }

    // Generate board config
    const boardConfig = await generateBoardConfig(studentId);

    // Cache for 1 hour
    await cache.set(cacheKey, boardConfig, 3600);

    return boardConfig;
  });

  // Validate movement (anti-cheat check)
  fastify.post('/validate-movement', {
    preHandler: authenticate,
  }, async (request, reply) => {
    const { studentId, position, steps } = request.body;

    if (!studentId || position === undefined || !steps) {
      return reply.status(400).send({ error: 'studentId, position, and steps required' });
    }

    // Only students can validate their own movement, or admins
    if (request.user.role === 'STUDENT' && request.user.id !== studentId) {
      return reply.status(403).send({ error: 'Cannot validate other students movement' });
    }

    const validation = await validateMovement(studentId, position, steps);

    return validation;
  });

  // Get leaderboard
  fastify.get('/leaderboard', {
    preHandler: authenticate,
  }, async (request, reply) => {
    const { scope = 'global', classId, limit = 10 } = request.query;

    const cacheKey = `leaderboard:${scope}:${classId || 'global'}`;
    const cached = await cache.get(cacheKey);

    if (cached) {
      return cached;
    }

    let where = {};

    if (scope === 'class' && classId) {
      const studentIds = await prisma.studentProfile.findMany({
        where: { classId },
        select: { studentId: true },
      });

      where.studentId = {
        in: studentIds.map(s => s.studentId),
      };
    }

    const topPlayers = await prisma.gameState.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
          },
        },
      },
      orderBy: [
        { boardPosition: 'desc' },
        { xp: 'desc' },
      ],
      take: parseInt(limit),
    });

    const leaderboard = topPlayers.map((gs, index) => ({
      rank: index + 1,
      student: gs.student,
      position: gs.boardPosition,
      xp: gs.xp,
      level: gs.level,
      streak: gs.streak,
    }));

    // Cache for 5 minutes
    await cache.set(cacheKey, leaderboard, 300);

    return leaderboard;
  });

  // Get all achievements
  fastify.get('/achievements', async (request, reply) => {
    const cacheKey = 'achievements:all';
    const cached = await cache.get(cacheKey);

    if (cached) {
      return cached;
    }

    const achievements = await prisma.achievement.findMany({
      orderBy: { tier: 'asc' },
    });

    await cache.set(cacheKey, achievements, 3600);

    return achievements;
  });
}
