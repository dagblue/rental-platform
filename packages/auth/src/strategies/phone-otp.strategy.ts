import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { PhoneVerificationService } from '../services/phone-verification.service';

@Injectable()
export class PhoneOtpStrategy extends PassportStrategy(Strategy, 'phone-otp') {
  constructor(private phoneVerificationService: PhoneVerificationService) {
    // Configure passport-local to use 'phone' as username field and 'code' as password field
    super({
      usernameField: 'phone',
      passwordField: 'code',
    });
  }

  async validate(phone: string, code: string): Promise<any> {
    // Validate inputs
    if (!phone) {
      throw new UnauthorizedException('Phone number is required');
    }

    if (!code) {
      throw new UnauthorizedException('Verification code is required');
    }

    // Clean Ethiopian phone
    const cleanPhone = this.cleanEthiopianPhone(phone);
    
    // Validate Ethiopian phone format
    if (!this.isValidEthiopianPhone(cleanPhone)) {
      throw new UnauthorizedException('Invalid Ethiopian phone number format');
    }

    try {
      // Verify OTP code
      const verified = await this.phoneVerificationService.verifyCode(cleanPhone, code);
      
      if (!verified) {
        throw new UnauthorizedException('Invalid verification code');
      }

      // Return user object
      return {
        phone: cleanPhone,
        phoneFormatted: this.formatEthiopianPhone(cleanPhone),
        verified: true,
        verifiedAt: new Date(),
        authMethod: 'phone-otp',
        trustLevel: 'BASIC',
        provider: this.detectProvider(cleanPhone)
      };
    } catch (error) {
      throw new UnauthorizedException(error.message || 'Verification failed');
    }
  }

  private cleanEthiopianPhone(phone: string): string {
    // Remove all non-numeric characters
    const numeric = phone.replace(/\D/g, '');
    
    // Convert to standard +251XXXXXXXXX format
    if (numeric.startsWith('0')) {
      return '+251' + numeric.substring(1);
    } else if (numeric.startsWith('251')) {
      return '+' + numeric;
    } else if (numeric.startsWith('9')) {
      return '+251' + numeric;
    }
    
    // If already in +251 format or unknown, return as is
    return phone;
  }

  private isValidEthiopianPhone(phone: string): boolean {
    // Ethiopian phone regex: +251 followed by 9 digits
    const ethiopianRegex = /^\+2519\d{8}$/;
    return ethiopianRegex.test(phone);
  }

  private formatEthiopianPhone(phone: string): string {
    // Format: +251 9X XXX XXXX
    if (phone.startsWith('+2519') && phone.length === 13) {
      return `${phone.substring(0, 4)} ${phone.substring(4, 6)} ${phone.substring(6, 9)} ${phone.substring(9)}`;
    }
    return phone;
  }

  private detectProvider(phone: string): string {
    if (!phone.startsWith('+2519')) return 'UNKNOWN';
    
    const prefix = phone.substring(4, 6); // Get the XX after +2519
    
    // Ethiopian telecom provider detection
    if (['90', '91', '92', '93', '94'].includes(prefix)) {
      return 'ETHIO_TELECOM';
    } else if (['95', '96', '97'].includes(prefix)) {
      return 'SAFARICOM';
    } else if (['98', '99'].includes(prefix)) {
      return 'MISC';
    }
    
    return 'OTHER';
  }
}