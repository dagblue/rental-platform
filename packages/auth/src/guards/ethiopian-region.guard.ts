import { ExecutionContext } from '@nestjs/common';

export class EthiopianRegionGuard {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const region = request.headers['x-ethiopian-region'] || request.user?.address?.region;
    
    // Add your region validation logic here
    const allowedRegions = ['Addis Ababa', 'Oromia', 'Amhara', 'Tigray', 'SNNPR', 'Sidama', 'Harari', 'Gambella', 'Benishangul-Gumuz', 'Afar', 'Somali'];
    
    return allowedRegions.includes(region);
  }
}
