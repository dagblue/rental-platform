import { z } from 'zod';

export const paymentProviderEnum = z.enum(['CBE_BIRR', 'TELEBIRR', 'MPESA', 'BANK_TRANSFER', 'CARD']);
export type PaymentProvider = z.infer<typeof paymentProviderEnum>;

export const paymentStatusEnum = z.enum([
  'PENDING', 
  'PROCESSING', 
  'COMPLETED', 
  'FAILED', 
  'REFUNDED', 
  'HELD_IN_ESCROW',
  'RELEASED'
]);

export const createPaymentDto = z.object({
  bookingId: z.string(),
  amount: z.number().positive(),
  provider: paymentProviderEnum,
  phoneNumber: z.string().optional(), // For mobile money
  accountNumber: z.string().optional(), // For bank transfer
  metadata: z.record(z.unknown()).optional(),
});

export type CreatePaymentDto = z.infer<typeof createPaymentDto>;
