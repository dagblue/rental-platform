import { z } from 'zod';
import { ethiopianRegionSchema } from '@rental-platform/validation';

export const createListingDto = z.object({
  // Basic Info
  title: z.string().min(5).max(100),
  description: z.string().min(20).max(2000),
  categoryId: z.string(),

  // Pricing
  pricePerDay: z.number().positive(),
  pricePerWeek: z.number().positive().optional(),
  pricePerMonth: z.number().positive().optional(),
  currency: z.enum(['ETB', 'USD']).default('ETB'),
  minimumRentalDays: z.number().min(1).default(1),
  maximumRentalDays: z.number().min(1).optional(),

  // Location (Ethiopian)
  region: ethiopianRegionSchema,
  city: z.string(),
  subcity: z.string().optional(),
  woreda: z.string(),
  kebele: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  exactLocation: z.boolean().default(false),

  // Item Details
  condition: z.enum(['NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'POOR']),
  brand: z.string().optional(),
  model: z.string().optional(),
  yearOfManufacture: z.number().min(1900).max(new Date().getFullYear()).optional(),
  specifications: z.record(z.unknown()).optional(),

  // Rules & Policies
  rules: z.array(z.string()).optional(),
  cancellationPolicy: z.enum(['FLEXIBLE', 'MODERATE', 'STRICT']).default('MODERATE'),

  // Trust Requirements
  minTrustLevel: z.enum(['NEW', 'BASIC', 'VERIFIED', 'TRUSTED']).default('BASIC'),
  requiresGuarantor: z.boolean().default(false),
  requiresIdVerification: z.boolean().default(false),
  requiresDeposit: z.boolean().default(false),
  depositAmount: z.number().optional(),

  // Delivery
  deliveryAvailable: z.boolean().default(false),
  deliveryFee: z.number().optional(),
  pickupRequired: z.boolean().default(true),
});

export type CreateListingDto = z.infer<typeof createListingDto>;
