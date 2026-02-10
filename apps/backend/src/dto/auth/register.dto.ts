import { z } from 'zod';
import {
  ethiopianPhoneSchema,
  ethiopianRegionSchema,
  ethiopianNameSchema,
} from '@rental-platform/validation';

export const registerDto = z.object({
  phone: ethiopianPhoneSchema,
  email: z.string().email('Invalid email').optional(),
  firstName: ethiopianNameSchema('First name'),
  lastName: ethiopianNameSchema('Last name'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/\d/, 'Password must contain at least one number')
    .regex(/[!@#$%^&*(),.?":{}|<>]/, 'Password must contain at least one special character'),
  region: ethiopianRegionSchema.optional(),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the terms and conditions',
  }),
});

export type RegisterDto = z.infer<typeof registerDto>;
