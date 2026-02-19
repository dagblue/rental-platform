import { z } from 'zod';

export const reviewQueryDto = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(10),
  sortBy: z.enum(['rating', 'createdAt', 'helpful']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  minRating: z.coerce.number().min(1).max(5).optional(),
  hasImages: z.coerce.boolean().optional(),
  verified: z.coerce.boolean().optional(),
});

export type ReviewQueryDto = z.infer<typeof reviewQueryDto>;
