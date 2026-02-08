import { Injectable } from '@nestjs/common';
import { SecurityUtils } from '../utils/security.utils';
import { IPhoneVerification } from '../interfaces/auth.interface';

@Injectable()
export class PhoneVerificationService {
  private verifications = new Map<string, IPhoneVerification>();
  private readonly MAX_ATTEMPTS = 3;

  async createVerification(phone: string): Promise<{ code: string; expiresAt: Date }> {
    // Check for existing active verification
    const existing = this.getActiveVerification(phone);
    if (existing && !SecurityUtils.isOTPExpired(existing.expiresAt)) {
      return { code: existing.code, expiresAt: existing.expiresAt };
    }

    // Generate new OTP
    const code = SecurityUtils.generateOTP();
    const expiresAt = SecurityUtils.getOTPExpiry();

    const verification: IPhoneVerification = {
      id: `${phone}_${Date.now()}`,
      phone,
      code,
      expiresAt,
      verified: false,
      attempts: 0,
      createdAt: new Date()
    };

    this.verifications.set(verification.id, verification);
    
    // Send SMS (simulated)
    await this.sendSMS(phone, code);
    
    return { code, expiresAt };
  }

  async verifyCode(phone: string, code: string): Promise<boolean> {
    const verification = this.getActiveVerification(phone);
    
    if (!verification) {
      throw new Error('No active verification found');
    }

    if (verification.attempts >= this.MAX_ATTEMPTS) {
      throw new Error('Maximum verification attempts exceeded');
    }

    if (SecurityUtils.isOTPExpired(verification.expiresAt)) {
      throw new Error('Verification code has expired');
    }

    verification.attempts++;

    if (verification.code !== code) {
      this.verifications.set(verification.id, verification);
      throw new Error('Invalid verification code');
    }

    verification.verified = true;
    this.verifications.set(verification.id, verification);
    
    return true;
  }

  private getActiveVerification(phone: string): IPhoneVerification | undefined {
    const verifications = Array.from(this.verifications.values())
      .filter(v => v.phone === phone && !v.verified)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return verifications[0];
  }

  private async sendSMS(phone: string, code: string): Promise<void> {
    // Simulate SMS sending - integrate with Ethiopian SMS provider in production
    console.log(`[SMS to ${phone}]: Your verification code is ${code}. Valid for 5 minutes.`);
  }
}