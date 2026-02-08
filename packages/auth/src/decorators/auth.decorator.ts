import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IAuthContext } from '../interfaces/auth.interface';

/**
 * Get the current authenticated user from the request
 */
export const AuthUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

/**
 * Get specific property from authenticated user
 */
export const AuthUserProperty = createParamDecorator(
  (property: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return property ? user?.[property] : user;
  },
);

/**
 * Get user ID from authenticated user
 */
export const UserId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user?.id;
  },
);

/**
 * Get user phone number from authenticated user
 */
export const UserPhone = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user?.phone;
  },
);

/**
 * Get user trust level
 */
export const UserTrustLevel = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user?.trustLevel;
  },
);

/**
 * Get full auth context
 */
export const AuthContext = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): IAuthContext => {
    const request = ctx.switchToHttp().getRequest();
    return {
      userId: request.user?.id,
      phone: request.user?.phone,
      trustLevel: request.user?.trustLevel,
      permissions: request.user?.permissions || [],
      sessionId: request.sessionId,
      ipAddress: request.ip,
      userAgent: request.headers['user-agent']
    };
  },
);