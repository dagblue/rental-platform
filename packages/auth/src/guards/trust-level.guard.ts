import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class TrustLevelGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredTrustLevels = this.reflector.get<string[]>('trustLevels', context.getHandler());
    const requirePhoneVerified = this.reflector.get<boolean>('phoneVerified', context.getHandler());
    const requireEthiopianId = this.reflector.get<boolean>('ethiopianIdVerified', context.getHandler());

    // If no trust requirements, allow access
    if (!requiredTrustLevels && !requirePhoneVerified && !requireEthiopianId) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Check trust levels
    if (requiredTrustLevels && !requiredTrustLevels.includes(user.trustLevel)) {
      throw new ForbiddenException(
        `Insufficient trust level. Required: ${requiredTrustLevels.join(' or ')}. You have: ${user.trustLevel}`
      );
    }

    // Check phone verification
    if (requirePhoneVerified && !user.isPhoneVerified) {
      throw new ForbiddenException('Phone verification required');
    }

    // Check Ethiopian ID verification
    if (requireEthiopianId && !user.idNumber) {
      throw new ForbiddenException('Ethiopian ID verification required');
    }

    return true;
  }
}