// Trust-related types (EXCLUDING duplicates already in user.types.ts)
// DO NOT define: TrustLevel, Guarantor (they're in user.types.ts)

export interface TrustScore {
  userId: string;
  overallScore: number;
  reliabilityScore: number;
  paymentScore: number;
  communicationScore: number;
  lastUpdated: Date;
}

export interface TrustMetric {
  metricId: string;
  userId: string;
  metricType: 'RELIABILITY' | 'PAYMENT' | 'COMMUNICATION' | 'TIMELINESS';
  value: number;
  weight: number;
  calculatedAt: Date;
}

export interface TrustEvent {
  eventId: string;
  userId: string;
  eventType:
    | 'RENTAL_COMPLETED'
    | 'PAYMENT_ON_TIME'
    | 'DISPUTE_RESOLVED'
    | 'LATE_RETURN'
    | 'DAMAGE_REPORTED';
  impact: number;
  description: string;
  occurredAt: Date;
  processed: boolean;
}

export interface TrustLevelRequirement {
  level: string; // References TrustLevel from user.types.ts
  minScore: number;
  requiredDocuments: string[];
  guarantorsRequired: number;
  maxRentalValue: number;
  depositMultiplier: number;
}

export interface TrustVerification {
  verificationId: string;
  userId: string;
  type: 'ID_CARD' | 'PASSPORT' | 'UTILITY_BILL' | 'BANK_STATEMENT';
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  verifiedAt: Date | null;
  verifiedBy: string | null;
}

export interface TrustCalculation {
  calculationId: string;
  userId: string;
  periodStart: Date;
  periodEnd: Date;
  startingScore: number;
  endingScore: number;
  delta: number;
  calculatedAt: Date;
}
