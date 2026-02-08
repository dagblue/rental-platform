import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { EthiopianRegion } from '@rental-platform/shared';

@Injectable()
export class EthiopianRegionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRegions = this.reflector.get<EthiopianRegion[]>('ethiopianRegions', context.getHandler());
    
    if (!requiredRegions || requiredRegions.length === 0) {
      return true; // No region restrictions
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Get user's region from address or request headers
    const userRegion = user.address?.region || request.headers['x-ethiopian-region'];
    
    if (!userRegion) {
      throw new ForbiddenException('Region information not available');
    }

    const hasAccess = requiredRegions.includes(userRegion as EthiopianRegion);
    if (!hasAccess) {
      throw new ForbiddenException(
        `Access restricted to regions: ${requiredRegions.join(', ')}. Your region: ${userRegion}`
      );
    }

    return true;
  }
}