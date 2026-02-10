import { env } from './env';

export const appConfig = {
  // Server
  port: parseInt(env.PORT, 10),
  nodeEnv: env.NODE_ENV,

  // API
  apiPrefix: '/api/v1',

  // CORS
  cors: {
    origin:
      env.NODE_ENV === 'production'
        ? ['https://your-frontend.com']
        : ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
  },

  // Rate limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  },

  // Security
  security: {
    bcryptRounds: 12,
    maxLoginAttempts: 5,
    lockoutTime: 15 * 60 * 1000, // 15 minutes
  },

  // Ethiopian context
  ethiopian: {
    defaultRegion: 'Addis Ababa',
    currency: 'ETB',
    phone: {
      defaultCountryCode: '+251',
      validOperators: ['091', '092', '093', '094', '095', '096', '097', '098', '099'],
    },
    id: {
      minAge: 18,
    },
  },
} as const;
