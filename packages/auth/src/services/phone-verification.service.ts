export class PhoneVerificationService {
  private verificationCodes: Map<string, { code: string; expires: Date }> = new Map();

  async generateVerificationCode(phone: string): Promise<string> {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + 10); // 10 minutes expiry
    
    this.verificationCodes.set(phone, { code, expires });
    
    // In production, send SMS here
    console.log(`Verification code for ${phone}: ${code}`);
    
    return code;
  }

  async verifyCode(phone: string, code: string): Promise<boolean> {
    const record = this.verificationCodes.get(phone);
    
    if (!record) {
      return false;
    }
    
    if (record.expires < new Date()) {
      this.verificationCodes.delete(phone);
      return false;
    }
    
    const isValid = record.code === code;
    
    if (isValid) {
      this.verificationCodes.delete(phone);
    }
    
    return isValid;
  }
}
