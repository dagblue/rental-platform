import { prisma } from '@rental-platform/database';
import { InMemoryRepository } from './base-repository';

// Keep in-memory for backward compatibility
const inMemoryRepo = new InMemoryRepository<any>();

export class UserRepository {
  async findById(id: string) {
    try {
      // Try database first
      const dbUser = await prisma.user.findUnique({
        where: { id },
        include: { profile: true }
      });
      if (dbUser) return dbUser;
    } catch (error) {
      console.log('Database not ready, falling back to in-memory');
    }
    
    // Fall back to in-memory
    return inMemoryRepo.findById(id);
  }

  async create(data: any) {
    try {
      // Try database
      const dbUser = await prisma.user.create({ data });
      return dbUser;
    } catch (error) {
      console.log('Database not ready, using in-memory');
      // Fall back to in-memory
      return inMemoryRepo.create(data);
    }
  }

  // Add other methods similarly...
}
