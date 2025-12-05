import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

let redis = null;
let redisAvailable = false;

// Only try to connect to Redis if explicitly enabled
const REDIS_ENABLED = process.env.REDIS_ENABLED === 'true';

if (REDIS_ENABLED) {
  redis = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      if (times > 3) {
        console.log('⚠️ Redis unavailable - running without cache');
        redisAvailable = false;
        return null; // Stop retrying
      }
      const delay = Math.min(times * 50, 2000);
      return delay;
    },
  });

  redis.on('connect', () => {
    console.log('✓ Redis connected');
    redisAvailable = true;
  });

  redis.on('error', (err) => {
    console.error('Redis error:', err.message);
    redisAvailable = false;
  });
} else {
  console.log('ℹ️ Redis disabled - running without cache (set REDIS_ENABLED=true to enable)');
}

// Cache helper functions
export const cache = {
  async get(key) {
    if (!redis || !redisAvailable) return null;
    try {
      const value = await redis.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.warn(`Cache get error for key ${key}:`, error.message);
      return null;
    }
  },

  async set(key, value, ttl = 3600) {
    if (!redis || !redisAvailable) return;
    try {
      await redis.set(key, JSON.stringify(value), 'EX', ttl);
    } catch (error) {
      console.warn(`Cache set error for key ${key}:`, error.message);
    }
  },

  async del(key) {
    if (!redis || !redisAvailable) return;
    try {
      await redis.del(key);
    } catch (error) {
      console.warn(`Cache del error for key ${key}:`, error.message);
    }
  },

  async invalidatePattern(pattern) {
    if (!redis || !redisAvailable) return;
    try {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      console.warn(`Cache invalidate error for pattern ${pattern}:`, error.message);
    }
  },
};

export default redis;
