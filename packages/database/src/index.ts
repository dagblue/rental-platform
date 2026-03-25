import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { Prisma } from '@prisma/client';

export const prisma = new PrismaClient();

const hashPasswordMiddleware: Prisma.Middleware = async (params, next) => {
  console.log('Ì¥ß Middleware triggered for:', params.model, params.action);
  
  if (params.model === 'User') {
    if (params.action === 'create' && params.args.data.passwordHash) {
      console.log('Ì¥ê Hashing password for new user...');
      console.log('Ì≥ù Original password length:', params.args.data.passwordHash.length);
      params.args.data.passwordHash = await bcrypt.hash(params.args.data.passwordHash, 10);
      console.log('‚úÖ Password hashed successfully');
    }
  }

  return next(params);
};

prisma.$use(hashPasswordMiddleware);

export * from '@prisma/client';
export { PrismaClient };
export { Prisma } from './client';

export const connectDatabase = async (): Promise<void> => {
  try {
    await prisma.$connect();
    console.log('‚úÖ Database connected successfully');
  } catch (error) {
    console.error('‚ùå Database connection error:', error);
    throw error;
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  await prisma.$disconnect();
  console.log('Ì≥§ Database disconnected');
};

export const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('‚ùå Database health check failed:', error);
    return false;
  }
};
