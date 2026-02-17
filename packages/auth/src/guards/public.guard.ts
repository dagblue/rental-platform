import { ExecutionContext } from '@nestjs/common';

export class PublicGuard {
  canActivate(context: ExecutionContext): boolean {
    // Public routes are always accessible
    return true;
  }
}
