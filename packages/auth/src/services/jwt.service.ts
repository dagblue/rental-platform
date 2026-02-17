import * as jwt from 'jsonwebtoken';

export interface JwtPayload {
  userId: string;
  phone: string;
  role?: string;
  [key: string]: unknown;
}

export class JwtService {
  private secret: string;
  private expiresIn: string;

  constructor() {
    this.secret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    this.expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  }

  generateAccessToken(payload: JwtPayload): string {
    // Fix: Pass options as the third parameter correctly
    return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn } as jwt.SignOptions);
  }

  generateRefreshToken(payload: JwtPayload): string {
    return jwt.sign(payload, this.secret, { expiresIn: '30d' } as jwt.SignOptions);
  }

  verifyAccessToken(token: string): JwtPayload | null {
    try {
      const decoded = jwt.verify(token, this.secret);
      return decoded as JwtPayload;
    } catch (error) {
      return null;
    }
  }

  verifyRefreshToken(token: string): JwtPayload | null {
    try {
      const decoded = jwt.verify(token, this.secret);
      return decoded as JwtPayload;
    } catch (error) {
      return null;
    }
  }

  decodeToken(token: string): JwtPayload | null {
    try {
      const decoded = jwt.decode(token);
      return decoded as JwtPayload;
    } catch (error) {
      return null;
    }
  }
}
