import { EthiopianAddress, EthiopianPhoneNumber, EthiopianLanguage } from '@rental-platform/shared';

export interface IUser {
  id: string;
  phone: EthiopianPhoneNumber;
  email?: string;
  firstName: string;
  lastName: string;
  passwordHash: string;
  idNumber?: string;
  address?: EthiopianAddress;
  preferredLanguage: EthiopianLanguage;
  
  // Trust system
  trustLevel: 'NEW' | 'BASIC' | 'VERIFIED' | 'TRUSTED';
  trustScore: number;
  verifiedAt?: Date;
  
  // Security
  isActive: boolean;
  isPhoneVerified: boolean;
  isEmailVerified: boolean;
  lastLoginAt?: Date;
  failedLoginAttempts: number;
  lockUntil?: Date;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

export interface ILoginResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    phone: string;
    firstName: string;
    lastName: string;
    trustLevel: string;
    preferredLanguage: EthiopianLanguage;
  };
  expiresIn: number;
}

export interface IRegistrationResponse {
  user: Omit<IUser, 'passwordHash'>;
  verificationRequired: boolean;
  message: string;
}

export interface IPhoneVerification {
  id: string;
  phone: string;
  code: string;
  expiresAt: Date;
  verified: boolean;
  attempts: number;
  createdAt: Date;
}

export interface IAuthContext {
  userId: string;
  phone: string;
  trustLevel: string;
  permissions: string[];
  sessionId: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface ITokenPayload {
  sub: string;
  phone: string;
  trustLevel: string;
  deviceId?: string;
  iat?: number;
  exp?: number;
}