/**
 * Prisma Singleton — shared across all modules.
 *
 * WHY: Every `new PrismaClient()` opens its own connection pool.
 * With 14 modules each instantiating their own client on import,
 * the app opens up to 14 × pool_size connections simultaneously —
 * easily exceeding Supabase free-tier's 10-connection limit, causing
 * connection queue stalls that manifest as slow response times across
 * the entire app.
 *
 * This module exports a single shared prisma instance that all modules
 * should import instead of calling `new PrismaClient()` directly.
 */
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    // Uncomment the line below only for query-level debugging. Never leave on in production.
    // log: ['query'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
