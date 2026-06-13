import { createClient } from 'redis';

// TODO: Initialize Redis client and export connection pool/handlers

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
export const redisClient = createClient({
  url: redisUrl,
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));

if (process.env.NODE_ENV !== 'test') {
  redisClient.connect()
    .then(() => console.log('Redis client connected'))
    .catch((err) => console.error('Redis connection failed:', err));
}
