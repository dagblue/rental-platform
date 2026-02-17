import { ExecutionContext } from '@nestjs/common';

export class TrustLevelGuard {
  constructor(private requiredLevel: string) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    
    if (!user || !user.trustLevel) {
      return false;
    }
    
    const trustLevels = ['NEW', 'BASIC', 'VERIFIED', 'TRUSTED'];
    const userLevelIndex = trustLevels.indexOf(user.trustLevel);
    const requiredLevelIndex = trustLevels.indexOf(this.requiredLevel);
    
    return userLevelIndex >= requiredLevelIndex;
  }
}
