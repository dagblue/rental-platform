import { z } from 'zod';

export const withdrawalDto = z.object({
  amount: z.number().positive(),
  provider: z.enum(['CBE_BIRR', 'TELEBIRR', 'MPESA', 'BANK_TRANSFER']),
  phoneNumber: z.string().optional(),
  bankAccount: z.string().optional(),
  bankName: z.string().optional(),
});

export type WithdrawalDto = z.infer<typeof withdrawalDto>;
