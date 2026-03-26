import { Request, Response } from 'express';
import { AuthService } from '@rental-platform/auth';
import { UserService } from '../../services/users/user.service';
import { loginDto, LoginDto } from '../../dto/auth/login.dto';
import { registerDto, RegisterDto } from '../../dto/auth/register.dto';

export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService
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
        acceptTerms: validatedData.agreeToTerms,
      };

      const result = await this.authService.register(authData);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: 'Registration failed',
        });
      }

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

      const result = await this.authService.login(
        validatedData.identifier,
        validatedData.password,
        validatedData.deviceId
      );

      if (!result.success) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials',
        });
      }

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

      const result = await this.authService.refreshToken(refreshToken);

      if (!result) {
        return res.status(401).json({
          success: false,
          error: 'Invalid refresh token',
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          token: result.access_token,
        },
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
