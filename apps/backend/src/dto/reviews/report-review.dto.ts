import { z } from 'zod';

export const reportReviewDto = z.object({
  reviewId: z.string(),
  reason: z.enum([
    'INAPPROPRIATE',
    'FAKE',
    'HARASSMENT',
    'SPAM',
    'OFFENSIVE',
    'OTHER'
  ]),
  description: z.string().min(10).max(500).optional(),
});

export type ReportReviewDto = z.infer<typeof reportReviewDto>;
