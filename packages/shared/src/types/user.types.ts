export enum UserRole {
  RENTER = 'RENTER',
  OWNER = 'OWNER',
  AGENT = 'AGENT',
  ADMIN = 'ADMIN',
  SUPPORT = 'SUPPORT',
  MODERATOR = 'MODERATOR',
}

export enum TrustLevel {
  NEW = 'NEW', // Level 0 - Phone verification only
  BASIC = 'BASIC', // Level 1 - ID + selfie verified
  VERIFIED = 'VERIFIED', // Level 2 - 2 guarantors + 3 rentals
  TRUSTED = 'TRUSTED', // Level 3 - 10+ rentals, no disputes
}

export enum VerificationStatus {
  PENDING = 'PENDING',
  PARTIAL = 'PARTIAL',
  COMPLETE = 'COMPLETE',
}

export enum VerificationType {
  PHONE = 'PHONE',
  EMAIL = 'EMAIL',
  ID_CARD = 'ID_CARD',
  PASSPORT = 'PASSPORT',
  DRIVING_LICENSE = 'DRIVING_LICENSE',
  ADDRESS = 'ADDRESS',
  PHYSICAL = 'PHYSICAL',
  SOCIAL = 'SOCIAL',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  BANNED = 'BANNED',
  DELETED = 'DELETED',
}

export interface User {
  id: string;
  phone: string;
  email: string | null;
  firstName: string;
  lastName: string;
  passwordHash: string;

  // Profile
  profileImage: string | null;
  dateOfBirth: Date | null;
  gender: 'MALE' | 'FEMALE' | 'OTHER' | null;

  // Ethiopian Identity
  governmentId: string | null;
  governmentIdType: 'KEBELE_ID' | 'PASSPORT' | 'DRIVING_LICENSE' | 'OTHER' | null;
  idVerified: boolean;

  // Roles & Trust
  role: UserRole;
  trustLevel: TrustLevel;
  trustScore: number;
  verificationStatus: VerificationStatus;

  // Verification Flags
  phoneVerified: boolean;
  emailVerified: boolean;
  addressVerified: boolean;
  physicalVerified: boolean;
  verificationDate: Date | null;

  // Status
  status: UserStatus;
  suspensionReason: string | null;
  suspensionEndsAt: Date | null;

  // Economic Metrics
  totalTransactions: number;
  totalSpent: number;
  totalEarned: number;
  averageRating: number;
  responseRate: number;
  cancellationRate: number;

  // Social
  guarantorCount: number;
  socialConnections: number;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  lastLogin: Date | null;
  lastActive: Date | null;
  agreedToTerms: boolean;
  marketingOptIn: boolean;
}

export interface UserProfile {
  id: string;
  userId: string;

  // Bio & Details
  bio: string | null;
  languages: string[]; // ['am', 'en', 'om', 'ti']
  occupation: string | null;
  education: string | null;
  skills: string[];

  // Ethiopian Address
  region: string;
  zone: string;
  woreda: string;
  kebele: string;
  city: string;
  subcity: string;
  houseNumber: string;
  landmark: string | null;
  latitude: number;
  longitude: number;
  formattedAddress: string;

  // Contact
  secondaryPhone: string | null;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  } | null;

  // Social Links
  socialLinks: {
    facebook: string | null;
    telegram: string | null;
    linkedin: string | null;
    twitter: string | null;
    instagram: string | null;
  };

  // Preferences
  preferences: {
    language: 'am' | 'en' | 'om' | 'ti';
    currency: 'ETB' | 'USD';
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
      marketing: boolean;
    };
    privacy: {
      showProfile: boolean;
      showContact: boolean;
      showLocation: boolean;
      showReviews: boolean;
    };
    twoFactorEnabled: boolean;
    autoApproveBookings: boolean;
    instantPayout: boolean;
  };

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

export interface Guarantor {
  id: string;
  userId: string;
  guarantorId: string;

  // Relationship
  relationship: 'FAMILY' | 'FRIEND' | 'COLLEAGUE' | 'NEIGHBOR' | 'RELATIVE' | 'OTHER';
  relationshipDuration: number; // in months
  relationshipDescription: string | null;

  // Status
  status: 'PENDING' | 'CONFIRMED' | 'DENIED' | 'EXPIRED' | 'REVOKED';
  confirmationCode: string;
  confirmationMethod: 'SMS' | 'CALL' | 'IN_PERSON' | 'OTHER';

  // Limits
  maxGuaranteeAmount: number;
  currentGuaranteeAmount: number;

  // Metadata
  requestedAt: Date;
  confirmedAt: Date | null;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;

  // Additional
  notes: string | null;
  isActive: boolean;
}

export interface Verification {
  id: string;
  userId: string;
  type: VerificationType;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'EXPIRED';

  // Documents
  documentFront: string | null;
  documentBack: string | null;
  selfieWithDocument: string | null;

  // Data
  documentNumber: string | null;
  documentExpiry: Date | null;
  issuingAuthority: string | null;
  issuedDate: Date | null;

  // Address Verification
  utilityBill: string | null;
  leaseAgreement: string | null;
  otherProof: string | null;

  // Physical Verification
  verifiedBy: string | null; // Agent ID
  verificationLocation: string | null;
  verificationNotes: string | null;

  // Metadata
  submittedAt: Date;
  verifiedAt: Date | null;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TrustLog {
  id: string;
  userId: string;

  // Changes
  oldLevel: TrustLevel;
  newLevel: TrustLevel;
  oldScore: number;
  newScore: number;
  scoreDelta: number;

  // Reason
  reason:
    | 'AUTOMATIC_UPDATE'
    | 'MANUAL_ADJUSTMENT'
    | 'VERIFICATION'
    | 'TRANSACTION'
    | 'REVIEW'
    | 'DISPUTE'
    | 'PENALTY'
    | 'OTHER';
  reasonDetails: string | null;

  // Trigger
  triggeredBy: 'SYSTEM' | 'ADMIN' | 'USER' | 'AGENT';
  triggeredById: string | null;

  // Metadata
  metadata: Record<string, unknown>;
  createdAt: Date;
}

export interface NotificationPreferences {
  userId: string;

  // Channels
  email: boolean;
  sms: boolean;
  push: boolean;
  inApp: boolean;

  // Types
  bookingRequests: boolean;
  bookingUpdates: boolean;
  paymentUpdates: boolean;
  trustUpdates: boolean;
  reviewNotifications: boolean;
  disputeUpdates: boolean;
  platformAnnouncements: boolean;
  marketing: boolean;

  // Frequency
  digestFrequency: 'INSTANT' | 'HOURLY' | 'DAILY' | 'WEEKLY';
  quietHours: {
    enabled: boolean;
    start: string; // "22:00"
    end: string; // "07:00"
  };

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}
