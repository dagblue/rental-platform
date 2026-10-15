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

/** Normalized session user (matches /users/profile `data.user`). */
export interface User {
  id: string;
  phone: string;
  email?: string | null;
  firstName: string;
  lastName: string;
  role: UserRole;
  trustLevel?: TrustLevel;
  profileImage?: string | null;
  region?: string;
  city?: string;
  subcity?: string;
  woreda?: string;
  kebele?: string;
  houseNumber?: string;
  occupation?: string;
  bio?: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  data?: {
    user: User;
    tokens?: AuthTokens;
    refreshed?: boolean;
  };
}

export interface LoginCredentials {
  identifier: string;
  password: string;
}

export interface RegisterCredentials {
  phone: string;
  password: string;
  firstName: string;
  lastName: string;
  agreeToTerms: boolean;
}
