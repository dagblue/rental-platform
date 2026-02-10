// Use the centralized database package
import { prisma as databasePrisma, PrismaClient } from '@rental-platform/database';

export class DatabaseService {
  private static instance: PrismaClient;

  private constructor() {}

  public static getInstance(): PrismaClient {
    if (!DatabaseService.instance) {
      // Use the prisma instance from database package
      DatabaseService.instance = databasePrisma;

      // Connection handling
      DatabaseService.instance
        .$connect()
        .then(() => console.log('✅ Database connected via @rental-platform/database'))
        .catch((err: Error) => {
          console.error('❌ Database connection failed:', err);
          process.exit(1);
        });
    }

    return DatabaseService.instance;
  }

  public static async disconnect(): Promise<void> {
    if (DatabaseService.instance) {
      await DatabaseService.instance.$disconnect();
    }
  }
}

// Export singleton instance (from database package)
export const prisma = DatabaseService.getInstance();
