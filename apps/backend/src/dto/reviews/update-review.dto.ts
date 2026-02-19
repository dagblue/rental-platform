import { z } from 'zod';

export const updateReviewDto = z.object({
  rating: z.number().min(1).max(5).optional(),
  comment: z.string().min(10).max(1000).optional(),
  pros: z.array(z.string()).optional(),
  cons: z.array(z.string()).optional(),
  images: z.array(z.string().url()).optional(),
});

export type UpdateReviewDto = z.infer<typeof updateReviewDto>;
