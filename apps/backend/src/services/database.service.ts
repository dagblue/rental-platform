// Use the centralized database package
import { prisma as databasePrisma } from '@rental-platform/database';

export class DatabaseService {
  private static instance: typeof databasePrisma;

  private constructor() {}

  public static getInstance(): typeof databasePrisma {
    if (!DatabaseService.instance) {
      // Use the prisma instance from database package
      DatabaseService.instance = databasePrisma;

      // Connection handling
      DatabaseService.instance
        .$connect()
        .then(() => console.log('‚úÖ Database connected via @rental-platform/database'))
        .catch((err: Error) => {
          console.error('‚ùå Database connection failed:', err);
          process.exit(1);
        });
    }

    return DatabaseService.instance;
  }

  public static async disconnect(): Promise<void> {
    if (DatabaseService.instance) {
      await DatabaseService.instance.$disconnect();
      console.log('Ì≥§ Database disconnected');
    }
  }
}

// Export singleton instance
export const prisma = DatabaseService.getInstance();
