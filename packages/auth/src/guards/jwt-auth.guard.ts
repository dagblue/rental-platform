import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SecurityUtils } from '../utils/security.utils';
import { ITokenPayload } from '../interfaces/auth.interface';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    // Add custom logic here before checking JWT
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    // Custom error handling
    if (err || !user) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    // Add Ethiopian context validation
    const request = context.switchToHttp().getRequest();
    this.validateEthiopianContext(user, request);

    return user;
  }

  private validateEthiopianContext(user: ITokenPayload, request: any): void {
    // Check if user has minimum trust level for sensitive operations
    if (request.route?.path?.includes('/secure/') && user.trustLevel === 'NEW') {
      throw new UnauthorizedException('Insufficient trust level for this operation');
    }

    // Add session tracking for security
    request.sessionId = SecurityUtils.generateSessionId();
    request.authTimestamp = new Date();
  }
}