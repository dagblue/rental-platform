import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { SecurityUtils } from '../utils/security.utils';
import { ITokenPayload } from '../interfaces/auth.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        ExtractJwt.fromUrlQueryParameter('token'),
        (req) => req?.cookies?.access_token, // Cookie extraction
      ]),
      ignoreExpiration: false,
      secretOrKey: SecurityUtils['JWT_SECRET'],
    });
  }

  async validate(payload: ITokenPayload): Promise<ITokenPayload> {
    // Add Ethiopian context validation
    this.validateEthiopianContext(payload);
    
    // In production, you would fetch user from database here
    // const user = await this.usersService.findById(payload.sub);
    // if (!user) {
    //   throw new UnauthorizedException('User not found');
    // }
    
    return {
      sub: payload.sub,
      phone: payload.phone,
      trustLevel: payload.trustLevel,
      deviceId: payload.deviceId,
    };
  }

  private validateEthiopianContext(payload: ITokenPayload): void {
    // Validate Ethiopian phone number format
    if (!payload.phone.startsWith('+251') && !payload.phone.startsWith('251')) {
      throw new UnauthorizedException('Invalid Ethiopian phone number in token');
    }

    // Additional Ethiopian security checks
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      throw new UnauthorizedException('Token has expired');
    }
  }
}