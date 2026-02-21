export enum UserRole {
  RENTER = 'RENTER',
  OWNER = 'OWNER',
  AGENT = 'AGENT',
  ADMIN = 'ADMIN',
  SUPPORT = 'SUPPORT',
  MODERATOR = 'MODERATOR',
}

export enum TrustLevel {
  NEW = 'NEW',
  BASIC = 'BASIC',
  VERIFIED = 'VERIFIED',
  TRUSTED = 'TRUSTED',
}

export interface User {
  id: string;
  phone: string;
  email?: string | null;
  firstName: string;
  lastName: string;
  role: UserRole;
  trustLevel?: TrustLevel;
  profileImage?: string | null;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    tokens: {
      access_token: string;
      refresh_token: string;
    };
  };
}

export interface LoginCredentials {
  phone: string;
  password: string;
}

export interface RegisterCredentials {
  phone: string;
  password: string;
  firstName: string;
  lastName: string;
  agreeToTerms: boolean;
}
