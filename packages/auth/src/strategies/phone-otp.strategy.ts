import { EthiopianAuthService } from '../services/ethiopian-auth.service';

export class PhoneOtpStrategy {
  constructor(private ethiopianAuthService: EthiopianAuthService) {}

  async validate(phone: string, otp: string): Promise<any> {
    const isValid = await this.ethiopianAuthService.verifyOTP(phone, otp);
    
    if (!isValid) {
      throw new Error('Invalid OTP');
    }
    
    // Return user data or create new user
    return { phone, verified: true };
  }

  async sendOtp(phone: string): Promise<{ success: boolean; message: string }> {
    const isValid = await this.ethiopianAuthService.validateEthiopianPhone(phone);
    
    if (!isValid) {
      return { success: false, message: 'Invalid Ethiopian phone number' };
    }
    
    await this.ethiopianAuthService.sendOTP(phone);
    return { success: true, message: 'OTP sent successfully' };
  }
}
