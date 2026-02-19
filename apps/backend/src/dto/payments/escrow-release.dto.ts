import { z } from 'zod';

export const releaseEscrowDto = z.object({
  bookingId: z.string(),
  releaseAmount: z.number().positive().optional(), // Make it optional
  releaseType: z.enum(['FULL', 'PARTIAL', 'DEPOSIT_ONLY']),
  reason: z.string().optional(),
}).refine((data) => {
  // If releaseType is PARTIAL, releaseAmount is required
  if (data.releaseType === 'PARTIAL' && !data.releaseAmount) {
    return false;
  }
  return true;
}, {
  message: "releaseAmount is required for PARTIAL release",
  path: ["releaseAmount"],
});

export type ReleaseEscrowDto = z.infer<typeof releaseEscrowDto>;
