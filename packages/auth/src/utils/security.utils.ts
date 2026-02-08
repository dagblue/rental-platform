import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { ITokenPayload } from '../interfaces/auth.interface';

export class SecurityUtils {
  private static readonly SALT_ROUNDS = 10;
  private static readonly JWT_SECRET = process.env.JWT_SECRET || 'ethiopian-rental-platform-secret-key';
  private static readonly JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'ethiopian-rental-platform-refresh-key';

  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  static generateAccessToken(payload: ITokenPayload): string {
    return jwt.sign(payload, this.JWT_SECRET, { expiresIn: '1h' });
  }

  static generateRefreshToken(payload: ITokenPayload): string {
    return jwt.sign(payload, this.JWT_REFRESH_SECRET, { expiresIn: '7d' });
  }

  static verifyToken(token: string, isRefreshToken = false): ITokenPayload {
    try {
      const secret = isRefreshToken ? this.JWT_REFRESH_SECRET : this.JWT_SECRET;
      return jwt.verify(token, secret) as ITokenPayload;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  static generateSessionId(): string {
    return uuidv4();
  }

  static generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  static getOTPExpiry(): Date {
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + 5);
    return expiry;
  }

  static isOTPExpired(expiryDate: Date): boolean {
    return new Date() > expiryDate;
  }
}