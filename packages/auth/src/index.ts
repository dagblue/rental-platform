// Services
export { AuthService } from './services/auth.service';
export { EthiopianAuthService } from './services/ethiopian-auth.service';
export { PhoneVerificationService } from './services/phone-verification.service';
export { JwtService } from './services/jwt.service';
export type { JwtPayload } from './services/jwt.service';

// Strategies
export { JwtStrategy } from './strategies/jwt.strategy';
export { LocalStrategy } from './strategies/local.strategy';
export { PhoneOtpStrategy } from './strategies/phone-otp.strategy';

// Utils
export { SecurityUtils } from './utils/security.utils';

// Interfaces
export * from './interfaces/auth.interface';

// Decorators
export * from './decorators';

// Guards
export * from './guards';

// Re-export useful types from dependencies
export {
  EthiopianRegion,
  EthiopianCity,
  EthiopianLanguage,
  EthiopianPhoneNumber,
  EthiopianAddress
} from '@rental-platform/shared';

export {
  ethiopianUserRegistrationSchema,
  ethiopianLoginSchema,
  EthiopianUserRegistrationInput,
  EthiopianLoginInput
} from '@rental-platform/validation';
