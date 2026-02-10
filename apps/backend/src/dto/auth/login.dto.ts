import { z } from 'zod';
import { ethiopianPhoneSchema } from '@rental-platform/validation';

export const loginDto = z.object({
  phone: ethiopianPhoneSchema,
  password: z.string().min(6, 'Password must be at least 6 characters'),
  deviceId: z.string().optional(),
});

export type LoginDto = z.infer<typeof loginDto>;
