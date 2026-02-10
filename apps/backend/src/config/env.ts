import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000'),

  // Database
  DATABASE_URL: z.string().url(),
  SHADOW_DATABASE_URL: z.string().url().optional(),

  // Auth
  JWT_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),

  // Ethiopian SMS (mock for now)
  ETHIOPIAN_SMS_API_KEY: z.string().optional(),
  ETHIOPIAN_SMS_SENDER: z.string().default('RentalApp'),

  // Payment (mock for now)
  M_PESA_API_KEY: z.string().optional(),
  TELEBIRR_API_KEY: z.string().optional(),

  // Trust system
  TRUST_SCORE_INITIAL: z.string().default('50'),
  TRUST_SCORE_VERIFICATION_BONUS: z.string().default('20'),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv() {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment validation failed:');
      error.errors.forEach((err) => {
        console.error(`   ${err.path.join('.')}: ${err.message}`);
      });
      process.exit(1);
    }
    throw error;
  }
}

export const env = validateEnv();
