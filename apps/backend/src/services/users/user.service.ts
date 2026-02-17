import { prisma } from '../../services/database.service';
import { UpdateProfileDto } from '../../dto/users/update-profile.dto';
import { VerifyIdDto } from '../../dto/users/verify-id.dto';

// In-memory stores
const userStore = new Map();
const verificationStore = new Map();
const guarantorStore = new Map();

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
    const phoneKey = typeof userData.phone === 'object' 
      ? userData.phone.formatted 
      : userData.phone;
    userStore.set(phoneKey, userData);
  }

  async updateProfile(userId: string, data: UpdateProfileDto) {
    // For now, return mock data
    return {
      id: userId,
      ...data,
      updatedAt: new Date()
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
      submittedAt: new Date()
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

  async addGuarantor(userId: string, guarantorPhone: string, relationship: string) {
    // Check if guarantor already exists for this user
    const existingGuarantors = guarantorStore.get(userId) || [];
    const alreadyExists = existingGuarantors.some(
      (g: any) => g.guarantorPhone === guarantorPhone
    );

    if (alreadyExists) {
      throw new Error('This guarantor has already been added');
    }

    // Create guarantor record with phone instead of mock ID
    const guarantor = {
      id: Date.now().toString(),
      userId,
      guarantorPhone, // Store the phone number
      relationship,
      status: 'PENDING',
      confirmationCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      createdAt: new Date()
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
