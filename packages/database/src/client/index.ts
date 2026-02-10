// packages/database/src/index.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Export Prisma client
export { prisma };
export { PrismaClient };

// Export all Prisma types
export * from '@prisma/client';

// Database utilities
export const connectDatabase = async (): Promise<void> => {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection error:', error);
    throw error;
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  await prisma.$disconnect();
  console.log('✅ Database disconnected');
};

export const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('❌ Database health check failed:', error);
    return false;
  }
};
