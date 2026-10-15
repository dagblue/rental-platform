import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';

export const prisma = new PrismaClient();

const hashPasswordMiddleware: Prisma.Middleware = async (params, next) => {
  if (params.model === 'User') {
    if (params.action === 'create' && params.args.data.passwordHash) {
      params.args.data.passwordHash = await bcrypt.hash(params.args.data.passwordHash, 10);
    }
  }
  return next(params);
};

prisma.$use(hashPasswordMiddleware);

export * from '@prisma/client';
export { PrismaClient };

export const connectDatabase = async (): Promise<void> => {
  try {
    await prisma.$connect();
    console.log('Database connected');
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  await prisma.$disconnect();
  console.log('Database disconnected');
};

export const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
};
