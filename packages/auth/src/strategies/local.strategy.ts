import { AuthService } from '../services/auth.service';

export class LocalStrategy {
  constructor(private authService: AuthService) {}

  async validate(phone: string, password: string): Promise<any> {
    const user = await this.authService.validateUser(phone, password);
    
    if (!user) {
      throw new Error('Invalid credentials');
    }
    
    return user;
  }
}
