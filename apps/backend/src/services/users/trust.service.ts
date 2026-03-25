import { prisma } from '../../services/database.service';

export interface TrustData {
  level: 'NEW' | 'BASIC' | 'VERIFIED' | 'TRUSTED';
  score: number;
  verifications: {
    phone: boolean;
    email: boolean;
    id: boolean;
    address: boolean;
    guarantors: number;
  };
}

export class TrustService {
  async getTrustData(userId: string): Promise<TrustData> {
    // Get user with related data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        verifications: true,
        profile: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Calculate verifications
    const verifications = {
      phone: user.phoneVerified || false,
      email: user.emailVerified || false,
      id: user.idVerified || false,
      address: user.addressVerified || false,
      guarantors: await this.countGuarantors(userId),
    };

    // Calculate trust score
    const score = this.calculateTrustScore(user, verifications);

    // Determine trust level
    const level = this.determineTrustLevel(score, user, verifications);

    return {
      level,
      score,
      verifications,
    };
  }

  private async countGuarantors(userId: string): Promise<number> {
    const count = await prisma.guarantor.count({
      where: {
        userId,
        status: 'CONFIRMED',
      },
    });
    return count;
  }

  private calculateTrustScore(user: any, verifications: any): number {
    let score = 30; // Base score

    // Add points for verifications
    if (verifications.phone) score += 10;
    if (verifications.email) score += 10;
    if (verifications.id) score += 20;
    if (verifications.address) score += 15;
    if (verifications.guarantors > 0) score += Math.min(15, verifications.guarantors * 5);

    // Add points for rental history (from bookings)
    // This would need a bookings count query

    return Math.min(100, score);
  }

  private determineTrustLevel(score: number, user: any, verifications: any): 'NEW' | 'BASIC' | 'VERIFIED' | 'TRUSTED' {
    if (score >= 80 && verifications.guarantors >= 2) return 'TRUSTED';
    if (score >= 60 && verifications.id) return 'VERIFIED';
    if (score >= 40 && verifications.phone) return 'BASIC';
    return 'NEW';
  }
}
