import { z } from 'zod';
import { ethiopianRegionSchema } from '@rental-platform/validation';

export const listingQueryDto = z.object({
  // Pagination
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),

  // Search
  search: z.string().optional(),
  categoryId: z.string().optional(),

  // Location filters
  region: ethiopianRegionSchema.optional(),
  city: z.string().optional(),
  woreda: z.string().optional(),

  // Price filters
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  currency: z.enum(['ETB', 'USD']).optional(),

  // Item filters
  condition: z.enum(['NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'POOR']).optional(),
  minTrustLevel: z.enum(['NEW', 'BASIC', 'VERIFIED', 'TRUSTED']).optional(),

  // Availability
  availableFrom: z.string().datetime().optional(),
  availableTo: z.string().datetime().optional(),

  // Sorting
  sortBy: z.enum(['price', 'createdAt', 'rating', 'relevance']).default('relevance'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),

  // Features
  deliveryAvailable: z.coerce.boolean().optional(),
  instantBooking: z.coerce.boolean().optional(),
});

export type ListingQueryDto = z.infer<typeof listingQueryDto>;
