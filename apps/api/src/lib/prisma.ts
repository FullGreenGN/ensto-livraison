/**
 * Prisma Client Singleton
 *
 * Re-exports the singleton instance from @repo/db so the entire API
 * always shares a single PrismaClient (and therefore a single connection
 * pool), regardless of how many modules import it.
 */
export { prisma } from "@repo/db";

