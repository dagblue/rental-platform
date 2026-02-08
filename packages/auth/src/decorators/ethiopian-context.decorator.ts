import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { EthiopianRegion } from '@rental-platform/shared';

/**
 * Decorator to get Ethiopian region from request headers or user
 */
export const EthiopianRegionHeader = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.headers['x-ethiopian-region'] || request.user?.address?.region;
  },
);

/**
 * Decorator to get Ethiopian language preference
 */
export const EthiopianLanguage = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.headers['accept-language'] || 
           request.user?.preferredLanguage || 
           'AMHARIC';
  },
);

/**
 * Decorator to check if request is within Ethiopian business hours
 */
export const IsEthiopianBusinessHours = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): boolean => {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();
    
    // Ethiopian business hours: 8:30 AM to 5:30 PM
    const startHour = 8, startMinute = 30;
    const endHour = 17, endMinute = 30;
    
    const currentMinutes = hour * 60 + minute;
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;
    
    return currentMinutes >= startMinutes && currentMinutes <= endMinutes;
  },
);