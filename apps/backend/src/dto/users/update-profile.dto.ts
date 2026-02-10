import { z } from 'zod';
import { ethiopianRegionSchema } from '@rental-platform/validation';

export const updateProfileDto = z.object({
  firstName: z.string().min(2).max(50).optional(),
  lastName: z.string().min(2).max(50).optional(),
  email: z.string().email('Invalid email').optional(),
  dateOfBirth: z.string().datetime().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  bio: z.string().max(500).optional(),
  occupation: z.string().max(100).optional(),
  education: z.string().max(100).optional(),
  languages: z.array(z.string()).optional(),
  skills: z.array(z.string()).optional(),
  
  // Ethiopian address
  region: ethiopianRegionSchema.optional(),
  zone: z.string().optional(),
  woreda: z.string().optional(),
  kebele: z.string().optional(),
  city: z.string().optional(),
  subcity: z.string().optional(),
  houseNumber: z.string().optional(),
  landmark: z.string().optional(),
  
  // Contact
  secondaryPhone: z.string().optional(),
  emergencyContact: z.object({
    name: z.string(),
    phone: z.string(),
    relationship: z.string(),
  }).optional(),
  
  // Social links
  facebook: z.string().url().optional(),
  telegram: z.string().optional(),
  linkedin: z.string().url().optional(),
  twitter: z.string().url().optional(),
  instagram: z.string().url().optional(),
});

export type UpdateProfileDto = z.infer<typeof updateProfileDto>;
