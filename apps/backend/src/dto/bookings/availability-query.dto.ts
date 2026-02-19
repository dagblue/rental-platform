import { z } from 'zod';

export const availabilityQueryDto = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
});

export type AvailabilityQueryDto = z.infer<typeof availabilityQueryDto>;
