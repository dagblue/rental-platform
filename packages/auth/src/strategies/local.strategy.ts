import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../services/auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      usernameField: 'phone',
      passwordField: 'password',
    });
  }

  async validate(phone: string, password: string): Promise<any> {
    try {
      // Clean phone number (remove +251/0 prefix issues)
      const cleanPhone = this.cleanEthiopianPhone(phone);
      
      // Validate with Ethiopian context
      const result = await this.authService.login(cleanPhone, password);
      
      // Return user information
      return {
        id: result.user.id,
        phone: result.user.phone,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        trustLevel: result.user.trustLevel,
        accessToken: result.accessToken,
      };
    } catch (error) {
      throw new UnauthorizedException(error.message || 'Invalid credentials');
    }
  }

  private cleanEthiopianPhone(phone: string): string {
    // Remove all non-numeric characters
    const numeric = phone.replace(/\D/g, '');
    
    // Convert to +251 format
    if (numeric.startsWith('0')) {
      return '+251' + numeric.substring(1);
    } else if (numeric.startsWith('251')) {
      return '+' + numeric;
    } else if (numeric.startsWith('9')) {
      return '+251' + numeric;
    }
    
    return phone;
  }
}