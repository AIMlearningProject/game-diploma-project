import bcrypt from 'bcrypt';
import prisma from '../services/prisma.js';
import { cache } from '../services/redis.js';

export default async function authRoutes(fastify, options) {
  // Local login
  fastify.post('/login', async (request, reply) => {
    const { email, password } = request.body;

    if (!email || !password) {
      return reply.status(400).send({ error: 'Email and password required' });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        studentProfile: true,
      },
    });

    if (!user || !user.password) {
      return reply.status(401).send({ error: 'Invalid credentials' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return reply.status(401).send({ error: 'Invalid credentials' });
    }

    const token = fastify.jwt.sign({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    // Cache user session
    await cache.set(`user:${user.id}`, {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    }, 3600);

    reply.setCookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
        studentProfile: user.studentProfile,
      },
      token,
    };
  });

  // Register (local)
  fastify.post('/register', async (request, reply) => {
    const { name, email, password, role = 'STUDENT' } = request.body;

    if (!name || !email || !password) {
      return reply.status(400).send({ error: 'Name, email, and password required' });
    }

    // Check if user exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return reply.status(409).send({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS) || 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        oauthProvider: 'LOCAL',
      },
    });

    // Create student profile if student
    if (role === 'STUDENT') {
      await prisma.studentProfile.create({
        data: {
          studentId: user.id,
          classId: request.body.classId, // Should be provided
          gradeLevel: request.body.gradeLevel || 1,
        },
      });

      // Create initial game state
      await prisma.gameState.create({
        data: {
          studentId: user.id,
          boardPosition: 0,
          streak: 0,
          xp: 0,
          level: 1,
        },
      });
    }

    const token = fastify.jwt.sign({
      id: user.id,
      email: user.email,
      role: user.role,
    });

    reply.setCookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    };
  });

  // Get current user
  fastify.get('/me', {
    preHandler: async (request, reply) => {
      try {
        await request.jwtVerify();
      } catch (err) {
        reply.status(401).send({ error: 'Unauthorized' });
      }
    },
  }, async (request, reply) => {
    const user = await prisma.user.findUnique({
      where: { id: request.user.id },
      include: {
        studentProfile: {
          include: {
            class: true,
          },
        },
        gameState: true,
      },
    });

    if (!user) {
      return reply.status(404).send({ error: 'User not found' });
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      profilePicture: user.profilePicture,
      studentProfile: user.studentProfile,
      gameState: user.gameState,
    };
  });

  // Logout
  fastify.post('/logout', async (request, reply) => {
    reply.clearCookie('token');
    return { message: 'Logged out successfully' };
  });

  // Google OAuth (placeholder - requires proper OAuth setup)
  fastify.get('/google', async (request, reply) => {
    // This would be configured with @fastify/oauth2
    return reply.status(501).send({ message: 'OAuth not yet configured' });
  });

  // Microsoft OAuth (placeholder)
  fastify.get('/microsoft', async (request, reply) => {
    return reply.status(501).send({ message: 'OAuth not yet configured' });
  });
}
