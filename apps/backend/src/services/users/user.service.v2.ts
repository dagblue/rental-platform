import { prisma } from '@rental-platform/database';
import { UpdateProfileDto } from '../../dto/users/update-profile.dto';
import { VerifyIdDto } from '../../dto/users/verify-id.dto';

type TrustLevel = 'NEW' | 'BASIC' | 'VERIFIED' | 'TRUSTED';

// Keep in-memory as backup
const userStore = new Map();
const verificationStore = new Map();
const guarantorStore = new Map();

export class UserService {
  private useDatabase = true; // Toggle this to switch

  async getProfile(userId: string) {
    if (this.useDatabase) {
      try {
        const dbUser = await prisma.user.findUnique({
          where: { id: userId },
          include: {
            profile: true,
            wallet: true,
            verifications: {
              where: { status: 'VERIFIED' },
              take: 1,
              orderBy: { verifiedAt: 'desc' },
            },
          },
        });
        
        if (dbUser) return dbUser;
      } catch (error) {
        console.error('Database error, falling back to memory:', error);
      }
    }

    // Fallback to in-memory
    for (const [key, user] of userStore.entries()) {
      if (user.id === userId) {
        return user;
      }
    }
    return null;
  }

  // Add other methods with same pattern...
}
