import { z } from 'zod';

export const verifyIdDto = z.object({
  idNumber: z.string().regex(/^\d{10}$/, 'Ethiopian ID must be 10 digits'),
  idType: z.enum(['ID_CARD', 'PASSPORT', 'DRIVING_LICENSE']),
  documentFront: z.string().url('Invalid document URL'),
  documentBack: z.string().url('Invalid document URL').optional(),
  selfieWithDocument: z.string().url('Invalid document URL').optional(),
});

export type VerifyIdDto = z.infer<typeof verifyIdDto>;
