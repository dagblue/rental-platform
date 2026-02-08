import { Injectable } from '@nestjs/common';
import { IUser } from '../interfaces/auth.interface';

@Injectable()
export class EthiopianAuthService {
  private readonly BUSINESS_HOURS = {
    start: { hour: 8, minute: 30 },
    end: { hour: 17, minute: 30 }
  };

  async applyEthiopianContext(user: IUser): Promise<{ restrictions: string[] }> {
    const restrictions: string[] = [];
    const now = new Date();

    // Check business hours
    if (!this.isWithinBusinessHours(now)) {
      restrictions.push('AFTER_HOURS');
    }

    // Check trust level
    if (user.trustLevel === 'NEW') {
      restrictions.push('LIMITED_TRUST');
    }

    return { restrictions };
  }

  async validateLoginContext(user: IUser, deviceId?: string): Promise<void> {
    const now = new Date();
    
    if (this.isSuspiciousLoginTime(now)) {
      console.warn(`Suspicious login time for user ${user.id}`);
    }
  }

  calculateEthiopianTrustBoost(user: IUser): number {
    let boost = 0;

    if (user.idNumber && user.trustLevel === 'VERIFIED') {
      boost += 50;
    }

    if (user.address) {
      boost += 30;
    }

    if (user.isPhoneVerified) {
      boost += 20;
    }

    return boost;
  }

  private isWithinBusinessHours(date: Date): boolean {
    const hour = date.getHours();
    const minute = date.getMinutes();
    const currentMinutes = hour * 60 + minute;
    const startMinutes = this.BUSINESS_HOURS.start.hour * 60 + this.BUSINESS_HOURS.start.minute;
    const endMinutes = this.BUSINESS_HOURS.end.hour * 60 + this.BUSINESS_HOURS.end.minute;

    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  }

  private isSuspiciousLoginTime(date: Date): boolean {
    const hour = date.getHours();
    return hour >= 22 || hour < 5;
  }
}

