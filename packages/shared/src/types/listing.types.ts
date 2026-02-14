import { TrustLevel } from './user.types';
export enum ListingStatus {
  DRAFT = 'DRAFT',
  PENDING_REVIEW = 'PENDING_REVIEW',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  RENTED = 'RENTED',
  MAINTENANCE = 'MAINTENANCE',
  BANNED = 'BANNED',
  DELETED = 'DELETED',
}

export enum ItemCondition {
  NEW = 'NEW',
  LIKE_NEW = 'LIKE_NEW',
  EXCELLENT = 'EXCELLENT',
  GOOD = 'GOOD',
  FAIR = 'FAIR',
  POOR = 'POOR',
  NEEDS_REPAIR = 'NEEDS_REPAIR',
}

export enum AvailabilityType {
  INSTANT = 'INSTANT', // Available immediately
  ADVANCE_BOOKING = 'ADVANCE_BOOKING', // Requires advance notice
  CALENDAR = 'CALENDAR', // Based on calendar availability
  REQUEST = 'REQUEST', // Owner must approve each request
}

export interface Listing {
  id: string;
  ownerId: string;
  categoryId: string;

  // Basic Info
  title: string;
  slug: string;
  description: string;
  shortDescription: string;

  // Pricing
  pricePerDay: number;
  pricePerWeek: number | null;
  pricePerMonth: number | null;
  currency: 'ETB' | 'USD';
  minimumRentalDays: number;
  maximumRentalDays: number;
  discountWeekly: number; // Percentage
  discountMonthly: number; // Percentage

  // Location
  location: {
    region: string;
    city: string;
    subcity: string;
    woreda: string;
    kebele: string;
    latitude: number;
    longitude: number;
    formattedAddress: string;
    isExact: boolean; // If exact location is shown
  };

  // Item Details
  condition: ItemCondition;
  yearOfManufacture: number | null;
  brand: string | null;
  model: string | null;
  specifications: Record<string, unknown>; // JSON object for category-specific specs

  // Media
  images: ListingImage[];
  videos: ListingVideo[];
  documents: ListingDocument[];

  // Availability
  availabilityType: AvailabilityType;
  calendar: AvailabilityCalendar[];
  advanceNoticeHours: number;
  sameDayBooking: boolean;
  instantBooking: boolean;

  // Trust Requirements
  minTrustLevel: TrustLevel;
  requiresGuarantors: number;
  requiresPhysicalVerification: boolean;
  requiresIdVerification: boolean;
  requiresDeposit: boolean;

  // Insurance
  insuranceIncluded: boolean;
  insuranceDetails: InsuranceDetails | null;
  insuranceProvider: string | null;
  insurancePremium: number | null;

  // Delivery
  deliveryAvailable: boolean;
  deliveryFee: number | null;
  deliveryRadius: number | null; // in kilometers
  pickupRequired: boolean;
  pickupLocation: string | null;

  // Rules
  rules: string[];
  cancellationPolicy: CancellationPolicy;
  damagePolicy: DamagePolicy;

  // Status
  status: ListingStatus;
  isFeatured: boolean;
  isVerified: boolean;
  verificationDate: Date | null;

  // Statistics
  views: number;
  saves: number;
  bookingsCount: number;
  averageRating: number;
  responseRate: number;
  responseTime: number; // in minutes

  // Metadata
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
  lastBookedAt: Date | null;
}

export interface ListingImage {
  id: string;
  listingId: string;
  url: string;
  thumbnailUrl: string;
  isPrimary: boolean;
  caption: string | null;
  order: number;
  verified: boolean; // If image has been verified by platform
  metadata: {
    width: number;
    height: number;
    size: number;
    format: string;
  };
  createdAt: Date;
}

export interface ListingVideo {
  id: string;
  listingId: string;
  url: string;
  thumbnailUrl: string;
  duration: number; // in seconds
  caption: string | null;
  order: number;
  createdAt: Date;
}

export interface ListingDocument {
  id: string;
  listingId: string;
  type: 'MANUAL' | 'INVOICE' | 'CERTIFICATE' | 'INSURANCE' | 'OTHER';
  title: string;
  url: string;
  verified: boolean;
  verifiedAt: Date | null;
  createdAt: Date;
}

export interface AvailabilityCalendar {
  date: Date;
  available: boolean;
  price: number | null; // Custom price for this date
  notes: string | null;
  blockedBy: string | null; // Booking ID if blocked
}

export interface CancellationPolicy {
  type: 'FLEXIBLE' | 'MODERATE' | 'STRICT' | 'SUPER_STRICT';
  description: string;
  refundPercentage: {
    days7: number; // 7+ days before
    days3: number; // 3-6 days before
    days1: number; // 1-2 days before
    day0: number; // same day
    afterStart: number; // after rental starts
  };
  gracePeriodHours: number;
}

export interface DamagePolicy {
  depositRequired: boolean;
  depositAmount: number;
  wearAndTear: string; // Description of acceptable wear and tear
  damageCategories: {
    minor: { description: string; maxCharge: number };
    moderate: { description: string; maxCharge: number };
    major: { description: string; maxCharge: number };
    total: { description: string; maxCharge: number };
  };
  inspectionProcess: string;
}

export interface InsuranceDetails {
  provider: string;
  policyNumber: string;
  coverageAmount: number;
  deductible: number;
  coverageTypes: string[];
  exclusions: string[];
  validFrom: Date;
  validTo: Date;
  documentUrl: string;
}
