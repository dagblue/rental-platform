import { Request, Response } from 'express';
import { AuthService } from '@rental-platform/auth/services';
import type { IUserService } from '../../services/users/user-service.interface';
import { loginDto, LoginDto } from '../../dto/auth/login.dto';
import { registerDto, RegisterDto } from '../../dto/auth/register.dto';
import { AUTH_COOKIE, clearAuthCookies, setAccessCookie, setAuthCookies } from '../../config/cookies';

export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: IUserService
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

      if (result.tokens) {
        setAuthCookies(res, result.tokens);
      }

      return res.status(201).json({
        success: true,
        message: 'Registration successful. Please verify your phone.',
        data: {
          user: result.user,
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

      if (result.tokens) {
        setAuthCookies(res, result.tokens);
      }

      return res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: result.user,
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

  async logout(_req: Request, res: Response) {
    clearAuthCookies(res);
    return res.status(200).json({
      success: true,
      message: 'Logged out',
    });
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
      const refresh =
        (req.cookies?.[AUTH_COOKIE.REFRESH] as string | undefined) ||
        (typeof req.body?.refreshToken === 'string' ? req.body.refreshToken : undefined);

      if (!refresh) {
        return res.status(400).json({
          success: false,
          error: 'Refresh token is required',
        });
      }

      const result = await this.authService.refreshToken(refresh);

      if (!result) {
        clearAuthCookies(res);
        return res.status(401).json({
          success: false,
          error: 'Invalid refresh token',
        });
      }

      setAccessCookie(res, result.access_token);

      return res.status(200).json({
        success: true,
        data: {
          refreshed: true,
        },
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }
}
