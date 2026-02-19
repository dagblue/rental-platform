import { z } from 'zod';

export const createBookingDto = z.object({
  listingId: z.string(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  renterNotes: z.string().max(500).optional(),
  numberOfGuests: z.number().min(1).max(20).default(1),
  
  // Ethiopian context
  specialRequirements: z.array(z.string()).optional(),
  needsGuarantor: z.boolean().default(false),
  guarantorPhone: z.string().optional(),
  
  // Payment
  paymentMethod: z.enum(['CARD', 'MOBILE_MONEY', 'BANK_TRANSFER']).default('MOBILE_MONEY'),
  mobileMoneyProvider: z.enum(['CBE_BIRR', 'TELEBIRR', 'MPESA']).optional(),
});

export type CreateBookingDto = z.infer<typeof createBookingDto>;
