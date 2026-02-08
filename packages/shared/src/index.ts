export const API_BASE_URL = process.env.API_URL || 'http://localhost:3000';
export const APP_NAME = 'Ethiopian Rental Platform';
export const APP_VERSION = '1.0.0';

// Export all types
export * from './types';

// Export all utilities
export * from './utils';

// Export constants
export * from './constants';

// Export schemas
export * from './schemas';

// Configuration
export const API_CONFIG = {
  BASE_URL: process.env.API_URL || 'http://localhost:3000',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  TIMEOUT: 30000,
  MAX_RETRIES: 3,
} as const;

export const APP_CONFIG = {
  NAME: 'Ethiopian Rental Platform',
  VERSION: '1.0.0',
  DESCRIPTION: 'Trust-based rental marketplace for Ethiopia',
  SUPPORT_EMAIL: 'support@rental-platform.et',
  SUPPORT_PHONE: '+251 11 123 4567',
} as const;

// Ethiopian-specific configuration
export const ETHIOPIAN_CONFIG = {
  DEFAULT_CURRENCY: 'ETB' as const,
  DEFAULT_LANGUAGE: 'am' as const,
  SUPPORTED_LANGUAGES: ['am', 'en', 'om', 'ti'] as const,
  TIMEZONE: 'Africa/Addis_Ababa',
  BUSINESS_HOURS: {
    START: '08:30',
    END: '17:30',
    LUNCH_START: '12:30',
    LUNCH_END: '13:30',
  },
  HOLIDAYS: [
    { date: '2024-01-07', name: 'Christmas' },
    { date: '2024-01-19', name: 'Timket' },
    { date: '2024-03-02', name: 'Adwa Victory Day' },
    { date: '2024-04-28', name: 'Easter' },
    { date: '2024-05-05', name: 'Eid al-Fitr' },
    { date: '2024-09-11', name: 'Ethiopian New Year' },
    { date: '2024-09-27', name: 'Meskel' },
    { date: '2024-12-16', name: 'Eid al-Adha' },
  ],
} as const;