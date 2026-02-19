import { z } from 'zod';

export const updateBookingStatusDto = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'REJECTED', 'CANCELLED', 'COMPLETED', 'DISPUTED']),
  reason: z.string().optional(),
  message: z.string().max(500).optional(),
});

export type UpdateBookingStatusDto = z.infer<typeof updateBookingStatusDto>;
