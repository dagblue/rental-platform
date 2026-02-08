import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { SecurityUtils } from '../utils/security.utils';
import { EthiopianAuthService } from './ethiopian-auth.service';
import { PhoneVerificationService } from './phone-verification.service';
import { 
  IUser, 
  ILoginResponse, 
  IRegistrationResponse,
  ITokenPayload 
} from '../interfaces/auth.interface';
import { 
  ethiopianUserRegistrationSchema, 
  EthiopianUserRegistrationInput 
} from '@rental-platform/validation';

@Injectable()
export class AuthService {
  private users = new Map<string, IUser>();

  constructor(
    private readonly phoneVerificationService: PhoneVerificationService,
    private readonly ethiopianAuthService: EthiopianAuthService
  ) {}

  async register(userData: EthiopianUserRegistrationInput): Promise<IRegistrationResponse> {
    const validatedData = ethiopianUserRegistrationSchema.parse(userData);
    
    // Check if phone exists
    if (this.findUserByPhone(validatedData.phone.number)) {
      throw new ConflictException('Phone number already registered');
    }

    // Hash password
    const passwordHash = await SecurityUtils.hashPassword(validatedData.password);

    // Create user
    const user: IUser = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      phone: validatedData.phone,
      email: validatedData.email,
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      passwordHash,
      idNumber: validatedData.idNumber,
      address: validatedData.address,
      preferredLanguage: validatedData.preferredLanguage,
      trustLevel: 'NEW',
      trustScore: 10,
      isActive: true,
      isPhoneVerified: false,
      isEmailVerified: false,
      failedLoginAttempts: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.users.set(user.id, user);

    // Create verification
    await this.phoneVerificationService.createVerification(user.phone.number);

    // Apply Ethiopian context
    await this.ethiopianAuthService.applyEthiopianContext(user);

    return {
      user: this.sanitizeUser(user),
      verificationRequired: true,
      message: 'Registration successful. Please verify your phone number.'
    };
  }

  async login(phone: string, password: string, deviceId?: string): Promise<ILoginResponse> {
    const user = this.findUserByPhone(phone);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check lock
    if (user.lockUntil && user.lockUntil > new Date()) {
      const minutesLeft = Math.ceil((user.lockUntil.getTime() - Date.now()) / 60000);
      throw new UnauthorizedException(`Account locked. Try again in ${minutesLeft} minutes`);
    }

    // Verify password
    const validPassword = await SecurityUtils.comparePassword(password, user.passwordHash);
    if (!validPassword) {
      user.failedLoginAttempts++;
      
      if (user.failedLoginAttempts >= 5) {
        user.lockUntil = new Date(Date.now() + 30 * 60 * 1000);
      }
      
      this.users.set(user.id, user);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Reset failed attempts
    user.failedLoginAttempts = 0;
    user.lockUntil = undefined;
    user.lastLoginAt = new Date();
    this.users.set(user.id, user);

    // Generate tokens
    const payload: ITokenPayload = {
      sub: user.id,
      phone: user.phone.number,
      trustLevel: user.trustLevel,
      deviceId
    };

    const accessToken = SecurityUtils.generateAccessToken(payload);
    const refreshToken = SecurityUtils.generateRefreshToken(payload);

    // Validate Ethiopian context
    await this.ethiopianAuthService.validateLoginContext(user, deviceId);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        phone: user.phone.formatted,
        firstName: user.firstName,
        lastName: user.lastName,
        trustLevel: user.trustLevel,
        preferredLanguage: user.preferredLanguage
      },
      expiresIn: 3600
    };
  }

  async verifyPhone(phone: string, code: string): Promise<boolean> {
    const verified = await this.phoneVerificationService.verifyCode(phone, code);
    
    if (verified) {
      const user = this.findUserByPhone(phone);
      if (user) {
        user.isPhoneVerified = true;
        user.trustScore += 20;
        user.updatedAt = new Date();
        this.users.set(user.id, user);
      }
    }
    
    return verified;
  }

  private findUserByPhone(phone: string): IUser | undefined {
    return Array.from(this.users.values()).find(
      user => user.phone.number === phone
    );
  }

  private sanitizeUser(user: IUser): Omit<IUser, 'passwordHash'> {
    const { passwordHash, ...sanitized } = user;
    return sanitized;
  }
}