import { z } from 'zod';
import {
  EthiopianRegion,
  EthiopianCity,
  EthiopianLanguage,
  EthiopianCalendarMonth,
  MobileMoneyProvider,
  EthiopianBank,
  EthiopianAddress,
  EthiopianPhoneNumber,
} from '@rental-platform/shared';

/**
 * Ethiopian Phone Number Validation
 * Uses the EthiopianPhoneNumber interface from shared types
 */
export const ethiopianPhoneSchema = z.string().transform((phone, ctx): EthiopianPhoneNumber => {
  // Clean and validate phone number
  const cleaned = phone.replace(/\s+/g, '');

  // Ethiopian phone validation logic
  const ethiopianRegex = /^(?:\+251|0|251)?(9\d{8})$/;
  const match = cleaned.match(ethiopianRegex);

  if (!match) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Invalid Ethiopian phone number format. Use +2519XXXXXXXX, 09XXXXXXXX, or 9XXXXXXXX',
    });
    return z.NEVER;
  }

  const number = match[1]; // Get the 9XXXXXXXX part
  const countryCode = '+251';
  const fullNumber = `${countryCode}${number}`;

  // Determine provider based on prefix (simplified logic)
  const prefix = number.charAt(0);
  const provider = prefix === '9' ? 'ETHIO_TELECOM' : prefix === '7' ? 'SAFARICOM' : 'OTHER';

  // Format: +251 9X XXX XXXX
  const formatted = `${countryCode} ${number.substring(0, 1)}${number.substring(1, 4)} ${number.substring(4, 7)} ${number.substring(7)}`;

  return {
    countryCode: '+251',
    number,
    formatted,
    isValid: true,
    provider,
  };
});

/**
 * Ethiopian Address Validation
 * Uses the EthiopianAddress interface from shared types
 */
export const ethiopianAddressSchema = z
  .object({
    region: z.nativeEnum(EthiopianRegion),
    zone: z.string().min(1, 'Zone is required'),
    woreda: z.string().min(1, 'Woreda is required'),
    kebele: z.string().min(1, 'Kebele is required'),
    city: z.nativeEnum(EthiopianCity),
    subcity: z.string().min(1, 'Subcity is required'),
    houseNumber: z.string().min(1, 'House number is required'),
    landmark: z.string().nullable(),
    coordinates: z
      .object({
        lat: z.number().min(-90).max(90),
        lng: z.number().min(-180).max(180),
      })
      .optional(),
    formattedAddress: z.string().optional(),
  })
  .transform((data): EthiopianAddress => {
    // Auto-generate formatted address if not provided
    const formatted =
      data.formattedAddress ||
      `${data.houseNumber}, ${data.kebele} Kebele, ${data.woreda} Woreda, ${data.subcity}, ${data.city}, ${data.region}`;

    // Return the EthiopianAddress object explicitly
    return {
      formattedAddress: formatted,
      region: data.region,
      zone: data.zone,
      woreda: data.woreda,
      kebele: data.kebele,
      city: data.city,
      subcity: data.subcity,
      houseNumber: data.houseNumber,
      landmark: data.landmark,
      coordinates: data.coordinates || { lat: 0, lng: 0 }, // Provide default coordinates
    };
  });

/**
 * User Registration Schema for Ethiopian Context
 */
export const ethiopianUserRegistrationSchema = z.object({
  phone: ethiopianPhoneSchema,
  email: z.string().email('Invalid email address').optional(),
  firstName: z
    .string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name cannot exceed 50 characters')
    .regex(/^[A-Za-z\s-]+$/, 'First name can only contain letters, spaces, and hyphens'),
  lastName: z
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name cannot exceed 50 characters')
    .regex(/^[A-Za-z\s-]+$/, 'Last name can only contain letters, spaces, and hyphens'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password cannot exceed 100 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/\d/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character'),
  idNumber: z
    .string()
    .regex(/^\d{10}$/, 'Ethiopian ID must be 10 digits')
    .optional(),
  address: ethiopianAddressSchema.optional(),
  preferredLanguage: z.nativeEnum(EthiopianLanguage).default(EthiopianLanguage.AMHARIC),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms and conditions',
  }),
});

/**
 * Login Schema (Phone-based for Ethiopia)
 */
export const ethiopianLoginSchema = z.object({
  phone: z.string().min(1, 'Phone number is required'),
  password: z.string().min(1, 'Password is required'),
  deviceId: z.string().optional().describe('Unique device identifier for security tracking'),
});

/**
 * Mobile Money Payment Schema
 */
export const mobileMoneyPaymentSchema = z.object({
  provider: z.nativeEnum(MobileMoneyProvider),
  phone: ethiopianPhoneSchema,
  amount: z.number().positive('Amount must be positive').min(1, 'Minimum payment is 1 ETB'),
  reference: z.string().optional(),
  pin: z.string().length(4, 'PIN must be 4 digits').regex(/^\d+$/, 'PIN must contain only numbers'),
});

/**
 * Trust Level Upgrade Request
 */
export const trustLevelUpgradeSchema = z.object({
  currentLevel: z.enum(['NEW', 'BASIC', 'VERIFIED', 'TRUSTED']),
  targetLevel: z.enum(['BASIC', 'VERIFIED', 'TRUSTED']),
  documents: z
    .array(
      z.object({
        type: z.enum(['ID_CARD', 'PASSPORT', 'DRIVER_LICENSE', 'UTILITY_BILL', 'BANK_STATEMENT']),
        url: z.string().url('Invalid document URL'),
        verified: z.boolean().default(false),
      })
    )
    .min(1, 'At least one document is required'),
  guarantors: z
    .array(
      z.object({
        name: z.string().min(2),
        phone: ethiopianPhoneSchema,
        relationship: z.string(),
        confirmed: z.boolean().default(false),
      })
    )
    .min(1, 'At least one guarantor is required')
    .max(5, 'Maximum 5 guarantors allowed'),
});

/**
 * Ethiopian Region Validation Schema
 */
export const ethiopianRegionSchema = z
  .nativeEnum(EthiopianRegion)
  .describe('Valid Ethiopian region');

/**
 * Ethiopian Name Validation Schema
 */
export const ethiopianNameSchema = (fieldName: string = 'Name') =>
  z
    .string()
    .min(2, `${fieldName} must be at least 2 characters`)
    .max(50, `${fieldName} must be less than 50 characters`)
    .regex(
      /^[A-Za-z\s\u1200-\u137F]+$/,
      `${fieldName} can only contain letters and spaces (Amharic allowed)`
    );

// Type exports
export type EthiopianUserRegistrationInput = z.infer<typeof ethiopianUserRegistrationSchema>;
export type EthiopianLoginInput = z.infer<typeof ethiopianLoginSchema>;
export type MobileMoneyPaymentInput = z.infer<typeof mobileMoneyPaymentSchema>;
export type TrustLevelUpgradeInput = z.infer<typeof trustLevelUpgradeSchema>;
