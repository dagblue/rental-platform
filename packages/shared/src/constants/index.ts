export * from './trust.constants';
export * from './payment.constants';
export * from './category.constants';
export * from './api.constants';
export * from './error.constants';

// packages/shared/src/constants/trust.constants.ts
export const TRUST_CONSTANTS = {
  // Score thresholds for each level
  THRESHOLDS: {
    NEW: 0,
    BASIC: 30,
    VERIFIED: 60,
    TRUSTED: 80,
    MAX: 100,
  },
  
  // Score weights for different factors
  WEIGHTS: {
    VERIFICATIONS: {
      PHONE: 10,
      EMAIL: 5,
      ID: 25,
      ADDRESS: 15,
      PHYSICAL: 30,
      SOCIAL: 20, // Social media verification
    },
    
    BEHAVIOR: {
      SUCCESSFUL_TRANSACTION: 2, // per transaction
      POSITIVE_REVIEW: 5, // per review (4-5 stars)
      NEUTRAL_REVIEW: 1, // per review (3 stars)
      RESPONSE_RATE: 0.1, // per percentage point
      RESPONSE_TIME: 0.05, // per minute under 1 hour
      COMPLETION_RATE: 0.2, // per percentage point
    },
    
    SOCIAL: {
      GUARANTOR_CONFIRMED: 10, // per confirmed guarantor
      NETWORK_SIZE: 0.5, // per connection (capped at 20)
      COMMUNITY_ENDORSEMENT: 15, // per endorsement
    },
    
    ECONOMIC: {
      TOTAL_SPENT: 0.001, // per ETB spent (capped at 10,000)
      TOTAL_EARNED: 0.0005, // per ETB earned (capped at 20,000)
      TRANSACTION_FREQUENCY: 0.1, // per transaction per month
    },
    
    TIME: {
      DAYS_ON_PLATFORM: 0.1, // per day (capped at 365)
      CONSISTENCY_BONUS: 20, // bonus for 6+ months activity
    },
    
    PENALTIES: {
      DISPUTE_LOST: -30,
      CANCELLATION: -15,
      LATE_RETURN: -10,
      DAMAGE_REPORT: -25,
      NEGATIVE_REVIEW: -20, // per review (1-2 stars)
      LOW_RESPONSE_RATE: -0.2, // per percentage point below 80%
      SLOW_RESPONSE: -0.1, // per minute over 1 hour
    },
  },
  
  // Deposit multipliers based on trust level
  DEPOSIT_MULTIPLIERS: {
    NEW: 2.0,
    BASIC: 1.5,
    VERIFIED: 1.0,
    TRUSTED: 0.5,
  },
  
  // Maximum rental values based on trust level (in ETB)
  RENTAL_LIMITS: {
    NEW: 5000,
    BASIC: 25000,
    VERIFIED: 100000,
    TRUSTED: 500000,
  },
  
  // Requirements for each trust level
  REQUIREMENTS: {
    NEW: {
      verifications: ['PHONE'],
      transactions: 0,
      guarantors: 0,
      minScore: 0,
    },
    BASIC: {
      verifications: ['PHONE', 'ID'],
      transactions: 1,
      guarantors: 0,
      minScore: 30,
      minDays: 7,
    },
    VERIFIED: {
      verifications: ['PHONE', 'ID', 'ADDRESS'],
      transactions: 5,
      guarantors: 2,
      minScore: 60,
      minDays: 30,
      minRating: 4.0,
    },
    TRUSTED: {
      verifications: ['PHONE', 'ID', 'ADDRESS', 'PHYSICAL'],
      transactions: 20,
      guarantors: 3,
      minScore: 80,
      minDays: 180,
      minRating: 4.5,
      maxDisputes: 1,
      maxCancellations: 2,
    },
  },
  
  // Update intervals (in milliseconds)
  UPDATE_INTERVALS: {
    SCORE: 24 * 60 * 60 * 1000, // 24 hours
    LEVEL: 7 * 24 * 60 * 60 * 1000, // 7 days
    REVIEW: 30 * 24 * 60 * 60 * 1000, // 30 days
  },
} as const;