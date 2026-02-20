import { prisma } from '../database.service';
import { UpdateProfileDto } from '../../dto/users/update-profile.dto';
import { VerifyIdDto } from '../../dto/users/verify-id.dto';
import { IUserService } from './user-service.interface';
import { dbConfig } from '../../config/database.config';
import { userStore } from './user.service';

export const TrustLevel = {
  NEW: 'NEW',
  BASIC: 'BASIC',
  VERIFIED: 'VERIFIED',
  TRUSTED: 'TRUSTED'
} as const;

export type TrustLevel = typeof TrustLevel[keyof typeof TrustLevel];

export class UserServiceDb implements IUserService {

async getProfile(userId: string) {
  // Database mode
  if (dbConfig.useDatabase) {
    try {
      const dbUser = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          profile: true,
          wallet: true,
          verifications: {
            orderBy: { submittedAt: 'desc' },
            take: 5,
          },
        },
      });
      
      if (dbUser) return dbUser;
    } catch (error) {
      console.error('Database error, falling back to memory:', error);
    }
  }
  
  // Memory mode fallback - directly use the Map from user.service
  for (const [key, user] of userStore.entries()) {
    if (user.id === userId) {
      return user;
    }
  }
  
  return null;
}

  async updateProfile(userId: string, data: UpdateProfileDto) {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined,
          gender: data.gender,
        },
      });

      if (data.region || data.city || data.bio) {
        await prisma.userProfile.upsert({
          where: { userId },
          create: {
            userId,
            bio: data.bio,
            languages: data.languages || [],
            occupation: data.occupation,
            education: data.education,
            skills: data.skills || [],
            region: data.region || 'Addis Ababa',
            zone: data.zone || '',
            woreda: data.woreda || '',
            kebele: data.kebele || '',
            city: data.city || 'Addis Ababa',
            subcity: data.subcity || '',
            houseNumber: data.houseNumber || '',
            landmark: data.landmark,
            formattedAddress: this.formatEthiopianAddress(data),
            secondaryPhone: data.secondaryPhone,
            emergencyContact: data.emergencyContact,
          },
          update: {
            bio: data.bio,
            languages: data.languages,
            occupation: data.occupation,
            education: data.education,
            skills: data.skills,
            region: data.region,
            zone: data.zone,
            woreda: data.woreda,
            kebele: data.kebele,
            city: data.city,
            subcity: data.subcity,
            houseNumber: data.houseNumber,
            landmark: data.landmark,
            formattedAddress: data.region ? this.formatEthiopianAddress(data) : undefined,
            secondaryPhone: data.secondaryPhone,
            emergencyContact: data.emergencyContact,
          },
        });
      }

      return user;
    } catch (error) {
      console.error('Database error:', error);
      throw error;
    }
  }

  async requestIdVerification(userId: string, data: VerifyIdDto) {
    try {
      return await prisma.verification.create({
        data: {
          userId,
          type: 'ID_CARD',
          status: 'PENDING',
          documentNumber: data.idNumber,
          documentFront: data.documentFront,
          documentBack: data.documentBack,
          selfieWithDocument: data.selfieWithDocument,
          submittedAt: new Date(),
        },
      });
    } catch (error) {
      console.error('Database error:', error);
      throw error;
    }
  }

  async getVerificationStatus(userId: string) {
    try {
      return await prisma.verification.findMany({
        where: { userId },
        orderBy: { submittedAt: 'desc' },
      });
    } catch (error) {
      console.error('Database error:', error);
      return [];
    }
  }

  async updateTrustLevel(userId: string, newLevel: string, reason: string) {
    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) throw new Error('User not found');

      const trustLevelEnum = newLevel.toUpperCase() as TrustLevel;

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { trustLevel: trustLevelEnum as any },
      });

      await prisma.trustLog.create({
        data: {
          userId,
          oldLevel: user.trustLevel,
          newLevel: trustLevelEnum,
          oldScore: user.trustScore || 0,
          newScore: user.trustScore || 0,
          scoreDelta: 0,
          reason,
          triggeredBy: 'SYSTEM',
        },
      });

      return updatedUser;
    } catch (error) {
      console.error('Database error:', error);
      throw error;
    }
  }

  async addGuarantor(userId: string, guarantorId: string, relationship: string) {
    try {
      const existing = await prisma.guarantor.findFirst({
        where: { userId, guarantorId }
      });

      if (existing) {
        throw new Error('This guarantor has already been added');
      }

      return await prisma.guarantor.create({
        data: {
          userId,
          guarantorId,
          relationship,
          status: 'PENDING',
          confirmationCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      });
    } catch (error) {
      console.error('Database error:', error);
      throw error;
    }
  }

  async getGuarantors(userId: string) {
    try {
      return await prisma.guarantor.findMany({
        where: { userId },
        include: {
          guarantor: {
            select: {
              id: true,
              phone: true,
              firstName: true,
              lastName: true,
              trustLevel: true,
            },
          },
        },
      });
    } catch (error) {
      console.error('Database error:', error);
      return [];
    }
  }

  private formatEthiopianAddress(data: UpdateProfileDto): string {
    const parts = [];
    if (data.houseNumber) parts.push(data.houseNumber);
    if (data.kebele) parts.push(`${data.kebele} Kebele`);
    if (data.woreda) parts.push(`${data.woreda} Woreda`);
    if (data.subcity) parts.push(data.subcity);
    if (data.city) parts.push(data.city);
    if (data.region) parts.push(data.region);
    return parts.join(', ');
  }
}
