import { Request, Response } from 'express';
import { AuthService } from '@rental-platform/auth';
import { loginDto, LoginDto } from '../../dto/auth/login.dto';
import { registerDto, RegisterDto } from '../../dto/auth/register.dto';
import { EthiopianLanguage } from '@rental-platform/shared';

export class AuthController {
  constructor(private authService: AuthService) {}

  async register(req: Request, res: Response) {
    try {
      // Validate request body
      const validatedData: RegisterDto = registerDto.parse(req.body);

      // Transform data to match auth service interface
      const authData = {
        phone: validatedData.phone as any, // Convert to string for auth service
        email: validatedData.email,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        password: validatedData.password,
        preferredLanguage: EthiopianLanguage.AMHARIC, // Use enum
        acceptTerms: validatedData.agreeToTerms,
        idNumber: undefined,
        address: undefined,
      };

      // Call auth service
      const result = await this.authService.register(authData);

      return res.status(201).json({
        success: true,
        message: 'Registration successful. Please verify your phone.',
        data: {
          user: result.user,
          tokens: result, // auth service returns tokens directly
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

      // Convert EthiopianPhoneNumber to string for auth service
      const phoneString =
        typeof validatedData.phone === 'string'
          ? validatedData.phone
          : (validatedData.phone as any).formatted || (validatedData.phone as any).number;

      const result = await this.authService.login(
        phoneString,
        validatedData.password,
        validatedData.deviceId
      );

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: result.user,
          tokens: result, // auth service returns tokens directly
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

  async verifyPhone(req: Request, res: Response) {
    try {
      const { phone, code } = req.body;

      if (!phone || !code) {
        return res.status(400).json({
          success: false,
          error: 'Phone and code are required',
        });
      }

      const isValid = await this.authService.verifyPhone(phone, code);

      if (isValid) {
        return res.status(200).json({
          success: true,
          message: 'Phone verified successfully',
        });
      } else {
        return res.status(400).json({
          success: false,
          error: 'Invalid verification code',
        });
      }
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

  async refreshToken(req: Request, res: Response) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          error: 'Refresh token is required',
        });
      }

      // Note: Your auth service doesn't have refreshToken method yet
      // We'll implement it or use JWT service directly
      return res.status(501).json({
        success: false,
        error: 'Refresh token not implemented yet',
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

  async getProfile(req: Request, res: Response) {
    try {
      // User should be attached by auth middleware
      const user = (req as any).user;

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated',
        });
      }

      return res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }
}
