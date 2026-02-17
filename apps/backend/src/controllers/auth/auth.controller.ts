import { Request, Response } from 'express';
import { AuthService } from '@rental-platform/auth';
import { UserService } from '../../services/users/user.service';
import { loginDto, LoginDto } from '../../dto/auth/login.dto';
import { registerDto, RegisterDto } from '../../dto/auth/register.dto';
import { EthiopianLanguage } from '@rental-platform/shared';

export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService // Add this
  ) {}

  async register(req: Request, res: Response) {
    try {
      const validatedData: RegisterDto = registerDto.parse(req.body);

      const authData = {
        phone: validatedData.phone,
        email: validatedData.email,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        password: validatedData.password,
        preferredLanguage: EthiopianLanguage.AMHARIC,
        acceptTerms: validatedData.agreeToTerms,
      };

      const result = await this.authService.register(authData);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: 'Registration failed',
        });
      }

      // Sync the user with UserService
      if (result.user) {
        this.userService.syncUser(result.user);
      }

      return res.status(201).json({
        success: true,
        message: 'Registration successful. Please verify your phone.',
        data: {
          user: result.user,
          tokens: result.tokens,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(400).json({
          success: false,
          error: error.message,
        });
      }
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const validatedData: LoginDto = loginDto.parse(req.body);

      const phoneString =
        typeof validatedData.phone === 'string'
          ? validatedData.phone
          : (validatedData.phone as any).formatted || (validatedData.phone as any).number;

      const result = await this.authService.login(
        phoneString,
        validatedData.password,
        validatedData.deviceId
      );

      if (!result.success) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials',
        });
      }

      // Sync the user with UserService
      if (result.user) {
        this.userService.syncUser(result.user);
      }

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: result.user,
          tokens: result.tokens,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        return res.status(401).json({
          success: false,
          error: error.message,
        });
      }
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

  // ... other methods remain the same
}
