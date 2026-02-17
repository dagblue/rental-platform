import { ExecutionContext } from '@nestjs/common';

export class JwtAuthGuard {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    
    // Check if user exists (set by JwtStrategy)
    return !!request.user;
  }
}
