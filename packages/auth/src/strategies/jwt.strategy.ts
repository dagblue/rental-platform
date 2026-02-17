import { JwtService } from '../services/jwt.service';

export class JwtStrategy {
  constructor(private jwtService: JwtService) {}

  async validate(payload: any) {
    return { userId: payload.userId, phone: payload.phone, role: payload.role };
  }

  async verify(token: string) {
    return this.jwtService.verifyAccessToken(token);
  }
}
