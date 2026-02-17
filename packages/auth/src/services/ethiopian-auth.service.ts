export class EthiopianAuthService {
  async validateEthiopianPhone(phone: string): Promise<boolean> {
    // Ethiopian phone validation: +251XXXXXXXXX
    const ethiopianPhoneRegex = /^\+251[0-9]{9}$/;
    return ethiopianPhoneRegex.test(phone);
  }

  async sendOTP(phone: string): Promise<string> {
    // In production, integrate with SMS service
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`OTP for ${phone}: ${otp}`);
    return otp;
  }

  async verifyOTP(phone: string, otp: string): Promise<boolean> {
    // In production, verify against stored OTP
    return otp.length === 6;
  }
}
