import { z } from 'zod';

export const createReviewDto = z.object({
  bookingId: z.string(),
  targetId: z.string(), // Can be userId or listingId
  targetType: z.enum(['USER', 'LISTING']),
  rating: z.number().min(1).max(5),
  comment: z.string().min(10).max(1000),
  pros: z.array(z.string()).optional(),
  cons: z.array(z.string()).optional(),
  images: z.array(z.string().url()).optional(),
  isAnonymous: z.boolean().default(false),
});

export type CreateReviewDto = z.infer<typeof createReviewDto>;
