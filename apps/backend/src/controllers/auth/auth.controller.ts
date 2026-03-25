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
      console.log('📝 Login request body:', req.body);
      
      const validatedData: LoginDto = loginDto.parse(req.body);
      console.log('✅ Validated data:', validatedData);

      const result = await this.authService.login(
        validatedData.identifier,
        validatedData.password,
        validatedData.deviceId
      );

      console.log('📊 Login result:', result.success);
      
      if (!result.success) {
        return res.status(401).json({
          success: false,
          error: 'Invalid credentials',
        });
      }

      // ... rest
    } catch (error) {
      console.error('Login error:', error);
      return res.status(401).json({
        success: false,
        error: error instanceof Error ? error.message : 'Login failed',
      });
    }
  }}
