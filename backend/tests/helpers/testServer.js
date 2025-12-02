/**
 * Test Server Helper
 * Creates a Fastify instance for testing without starting the actual server
 */

import Fastify from 'fastify';
import fastifyCors from '@fastify/cors';
import fastifyHelmet from '@fastify/helmet';
import fastifyJwt from '@fastify/jwt';
import fastifyCookie from '@fastify/cookie';
import fastifyRateLimit from '@fastify/rate-limit';
import fastifyWebsocket from '@fastify/websocket';

// Import routes
import authRoutes from '../../src/routes/auth.js';
import studentRoutes from '../../src/routes/students.js';
import teacherRoutes from '../../src/routes/teachers.js';
import gameRoutes from '../../src/routes/game.js';
import bookRoutes from '../../src/routes/books.js';
import analyticsRoutes from '../../src/routes/analytics.js';
import adminRoutes from '../../src/routes/admin.js';

export async function createTestServer() {
  const fastify = Fastify({
    logger: false, // Disable logging in tests
  });

  // Register plugins
  await fastify.register(fastifyHelmet, {
    contentSecurityPolicy: false, // Disable CSP in tests
  });

  await fastify.register(fastifyCors, {
    origin: true,
    credentials: true,
  });

  await fastify.register(fastifyCookie);

  await fastify.register(fastifyJwt, {
    secret: process.env.JWT_SECRET || 'test-secret',
    cookie: {
      cookieName: 'token',
      signed: false,
    },
  });

  await fastify.register(fastifyRateLimit, {
    max: 1000, // High limit for tests
    timeWindow: 60000,
  });

  await fastify.register(fastifyWebsocket);

  // Health check route
  fastify.get('/health', async (request, reply) => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  // Register routes
  await fastify.register(authRoutes, { prefix: '/api/auth' });
  await fastify.register(studentRoutes, { prefix: '/api/students' });
  await fastify.register(teacherRoutes, { prefix: '/api/teachers' });
  await fastify.register(gameRoutes, { prefix: '/api/game' });
  await fastify.register(bookRoutes, { prefix: '/api/books' });
  await fastify.register(analyticsRoutes, { prefix: '/api/analytics' });
  await fastify.register(adminRoutes, { prefix: '/api/admin' });

  // Error handler
  fastify.setErrorHandler((error, request, reply) => {
    if (error.validation) {
      reply.status(400).send({
        error: 'Validation Error',
        message: error.message,
        details: error.validation,
      });
      return;
    }

    reply.status(error.statusCode || 500).send({
      error: error.name || 'Internal Server Error',
      message: error.message || 'An unexpected error occurred',
    });
  });

  return fastify;
}

/**
 * Helper to generate JWT token for testing
 */
export function generateTestToken(fastify, user) {
  return fastify.jwt.sign({
    id: user.id,
    email: user.email,
    role: user.role,
  });
}
