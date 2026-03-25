import { z } from 'zod';

export const loginDto = z.object({
  identifier: z.string().min(1, 'Phone number or email is required'),
  password: z.string().min(1, 'Password is required'),
  deviceId: z.string().optional(),
});

export type LoginDto = z.infer<typeof loginDto>;
