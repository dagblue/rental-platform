import { prisma } from '../../services/database.service';
import { UpdateProfileDto } from '../../dto/users/update-profile.dto';
import { VerifyIdDto } from '../../dto/users/verify-id.dto';

// In-memory stores
const userStore = new Map();
const verificationStore = new Map(); // Add this for verifications
const guarantorStore = new Map(); // Add this for guarantors

export class UserService {
  async getProfile(userId: string) {
    // Try to find in our store first
    for (const [key, user] of userStore.entries()) {
      if (user.id === userId) {
        return user;
      }
    }

    // If not found, try database
    try {
      const dbUser = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          profile: true,
        },
      });

      if (dbUser) {
        return dbUser;
      }
    } catch (error) {
      console.error('Database error:', error);
    }

    return null;
  }

  // Add a method to sync with AuthService
  syncUser(userData: any) {
    const phoneKey = typeof userData.phone === 'object' ? userData.phone.formatted : userData.phone;
    userStore.set(phoneKey, userData);
  }

  async updateProfile(userId: string, data: UpdateProfileDto) {
    // For now, return mock data
    return {
      id: userId,
      ...data,
      updatedAt: new Date(),
    };
  }

  async requestIdVerification(userId: string, data: VerifyIdDto) {
    // Create verification record
    const verification = {
      id: Date.now().toString(),
      userId,
      type: data.idType || 'ID_CARD',
      status: 'PENDING',
      documentNumber: data.idNumber,
      documentFront: data.documentFront,
      documentBack: data.documentBack,
      selfieWithDocument: data.selfieWithDocument,
      submittedAt: new Date(),
    };

    // Store verification
    if (!verificationStore.has(userId)) {
      verificationStore.set(userId, []);
    }
    verificationStore.get(userId).push(verification);

    return verification;
  }

  async getVerificationStatus(userId: string) {
    // Return verifications for this user
    return verificationStore.get(userId) || [];
  }

  async addGuarantor(userId: string, guarantorId: string, relationship: string) {
    // Create guarantor record
    const guarantor = {
      id: Date.now().toString(),
      userId,
      guarantorId,
      relationship,
      status: 'PENDING',
      createdAt: new Date(),
    };

    // Store guarantor
    if (!guarantorStore.has(userId)) {
      guarantorStore.set(userId, []);
    }
    guarantorStore.get(userId).push(guarantor);

    return guarantor;
  }

  async getGuarantors(userId: string) {
    // Return guarantors for this user
    return guarantorStore.get(userId) || [];
  }
}
