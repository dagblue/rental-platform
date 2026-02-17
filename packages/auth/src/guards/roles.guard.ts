import { ExecutionContext } from '@nestjs/common';

export class RolesGuard {
  constructor(private allowedRoles: string[]) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    if (!user || !user.role) {
      return false;
    }
    
    return this.allowedRoles.includes(user.role);
  }
}
