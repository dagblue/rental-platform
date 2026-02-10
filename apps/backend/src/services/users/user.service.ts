import type { Prisma } from "@rental-platform/database";
import { prisma } from '../../services/database.service';
import { UpdateProfileDto } from '../../dto/users/update-profile.dto';
import { VerifyIdDto } from '../../dto/users/verify-id.dto';

export class UserService {
  async getProfile(userId: string) {
    return prisma.user.findUnique({
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
  }

  async updateProfile(userId: string, data: UpdateProfileDto) {
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

    // Update or create profile
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
          facebook: data.facebook,
          telegram: data.telegram,
          linkedin: data.linkedin,
          twitter: data.twitter,
          instagram: data.instagram,
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
          facebook: data.facebook,
          telegram: data.telegram,
          linkedin: data.linkedin,
          twitter: data.twitter,
          instagram: data.instagram,
        },
      });
    }

    return user;
  }

  async requestIdVerification(userId: string, data: VerifyIdDto) {
    return prisma.verification.create({
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
  }

  async getVerificationStatus(userId: string) {
    return prisma.verification.findMany({
      where: { userId },
      orderBy: { submittedAt: 'desc' },
    });
  }

  async updateTrustLevel(userId: string, newLevel: string, reason: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    if (!user) throw new Error('User not found');

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { trustLevel: newLevel },
    });

    // Log trust level change
    await prisma.trustLog.create({
      data: {
        userId,
        oldLevel: user.trustLevel,
        newLevel: newLevel as any,
        oldScore: user.trustScore,
        newScore: user.trustScore,
        scoreDelta: 0,
        reason,
        triggeredBy: 'SYSTEM',
      },
    });

    return updatedUser;
  }

  async addGuarantor(userId: string, guarantorId: string, relationship: string) {
    return prisma.guarantor.create({
      data: {
        userId,
        guarantorId,
        relationship,
        status: 'PENDING',
        confirmationCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });
  }

  async getGuarantors(userId: string) {
    return prisma.guarantor.findMany({
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
