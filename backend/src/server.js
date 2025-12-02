import Fastify from 'fastify';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';
import fastifyCors from '@fastify/cors';
import fastifyHelmet from '@fastify/helmet';
import fastifyJwt from '@fastify/jwt';
import fastifyCookie from '@fastify/cookie';
import fastifyRateLimit from '@fastify/rate-limit';
import fastifyWebsocket from '@fastify/websocket';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create Fastify instance
const fastify = Fastify({
  logger: {
    level: process.env.LOG_LEVEL || 'info',
    transport: process.env.NODE_ENV === 'development' ? {
      target: 'pino-pretty',
      options: {
        translateTime: 'HH:MM:ss Z',
        ignore: 'pid,hostname',
      },
    } : undefined,
  },
});

// Register plugins
await fastify.register(fastifyHelmet, {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
});

await fastify.register(fastifyCors, {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
});

await fastify.register(fastifyCookie);

await fastify.register(fastifyJwt, {
  secret: process.env.JWT_SECRET || 'change-this-secret-in-production',
  cookie: {
    cookieName: 'token',
    signed: false,
  },
});

await fastify.register(fastifyRateLimit, {
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  timeWindow: parseInt(process.env.RATE_LIMIT_TIMEWINDOW) || 60000,
});

await fastify.register(fastifyWebsocket);

// Health check route
fastify.get('/health', async (request, reply) => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

// Import and register routes
import authRoutes from './routes/auth.js';
import studentRoutes from './routes/students.js';
import teacherRoutes from './routes/teachers.js';
import gameRoutes from './routes/game.js';
import bookRoutes from './routes/books.js';
import analyticsRoutes from './routes/analytics.js';
import adminRoutes from './routes/admin.js';

await fastify.register(authRoutes, { prefix: '/api/auth' });
await fastify.register(studentRoutes, { prefix: '/api/students' });
await fastify.register(teacherRoutes, { prefix: '/api/teachers' });
await fastify.register(gameRoutes, { prefix: '/api/game' });
await fastify.register(bookRoutes, { prefix: '/api/books' });
await fastify.register(analyticsRoutes, { prefix: '/api/analytics' });
await fastify.register(adminRoutes, { prefix: '/api/admin' });

// Error handler
fastify.setErrorHandler((error, request, reply) => {
  fastify.log.error(error);

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

// Start server
const start = async () => {
  try {
    const port = parseInt(process.env.PORT) || 3000;
    const host = process.env.HOST || '0.0.0.0';

    await fastify.listen({ port, host });

    console.log(`
╔═══════════════════════════════════════════════╗
║   Lukudiplomi Game API Server                 ║
║   Environment: ${process.env.NODE_ENV || 'development'}                    ║
║   Port: ${port}                                  ║
║   Ready to accept requests!                   ║
╚═══════════════════════════════════════════════╝
    `);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
