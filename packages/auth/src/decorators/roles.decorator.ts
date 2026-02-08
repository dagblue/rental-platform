import { SetMetadata } from '@nestjs/common';
import { EthiopianRegion } from '@rental-platform/shared';

/**
 * Decorator to set required roles
 */
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

/**
 * Decorator to set required trust levels
 */
export const TrustLevels = (...levels: ('NEW' | 'BASIC' | 'VERIFIED' | 'TRUSTED')[]) =>
  SetMetadata('trustLevels', levels);

/**
 * Decorator for Ethiopian regional access control
 */
export const EthiopianRegions = (...regions: EthiopianRegion[]) =>
  SetMetadata('ethiopianRegions', regions);

/**
 * Decorator for public endpoints (no auth required)
 */
export const Public = () => SetMetadata('isPublic', true);

/**
 * Decorator for endpoints requiring phone verification
 */
export const PhoneVerified = () => SetMetadata('phoneVerified', true);

/**
 * Decorator for endpoints requiring Ethiopian ID verification
 */
export const EthiopianIdVerified = () => SetMetadata('ethiopianIdVerified', true);