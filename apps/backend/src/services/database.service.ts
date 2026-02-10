// Temporary: Use PrismaClient directly until we fix the package
import { PrismaClient } from '@prisma/client';

export class DatabaseService {
  private static instance: PrismaClient;

  private constructor() {}

  public static getInstance(): PrismaClient {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new PrismaClient({
        log:
          process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
      });

      // Connection handling
      DatabaseService.instance
        .$connect()
        .then(() => console.log('✅ Database connected'))
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

// Export singleton instance
export const prisma = DatabaseService.getInstance();
