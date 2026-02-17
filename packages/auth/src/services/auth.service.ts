import { JwtService } from './jwt.service';

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export interface User {
  id: string;
  phone: any; // Can be string or phone object
  email?: string;
  firstName?: string;
  lastName?: string;
  role: string;
}

export interface RegisterResult {
  success: boolean;
  user?: User;
  tokens?: AuthTokens;
}

export interface LoginResult {
  success: boolean;
  user?: User;
  tokens?: AuthTokens;
}

export class AuthService {
  private users: Map<string, any> = new Map();
  private verificationCodes: Map<string, string> = new Map();

  constructor(private jwtService: JwtService) {}

  async register(userData: any): Promise<RegisterResult> {
    try {
      // Get phone string for lookup key
      const phoneKey = typeof userData.phone === 'object' 
        ? userData.phone.formatted || userData.phone.number 
        : userData.phone;

      // Check if user already exists
      if (this.users.has(phoneKey)) {
        return {
          success: false,
        };
      }

      // Create new user
      const newUser = {
        id: Date.now().toString(),
        phone: userData.phone, // Store the phone object as received
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: 'USER',
        createdAt: new Date()
      };

      // Store user with phone key for lookup
      this.users.set(phoneKey, {
        ...newUser,
        password: userData.password // In production, hash this!
      });

      // Generate tokens
      const access_token = this.jwtService.generateAccessToken({
        userId: newUser.id,
        phone: userData.phone,
        role: newUser.role
      });
      
      const refresh_token = this.jwtService.generateRefreshToken({
        userId: newUser.id,
        phone: userData.phone,
        role: newUser.role
      });

      const tokens = {
        access_token,
        refresh_token
      };

      console.log(`‚úÖ User registered with phone: ${phoneKey}`);

      // Generate verification code
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      this.verificationCodes.set(phoneKey, verificationCode);
      console.log(`Ì≥± Verification code: ${verificationCode}`);

      return {
        success: true,
        user: newUser,
        tokens: tokens
      };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false
      };
    }
  }

  async login(phoneInput: string, password: string, deviceId?: string): Promise<LoginResult> {
    try {
      console.log(`Ì¥ê Login attempt for phone input:`, phoneInput);
      
      // Try different phone formats to find the user
      let user = null;
      
      // Check all possible phone formats
      for (const [key, value] of this.users.entries()) {
        const userPhone = value.phone;
        
        // If userPhone is an object, check its properties
        if (typeof userPhone === 'object') {
          if (userPhone.formatted === phoneInput || 
              userPhone.number === phoneInput.replace('+251', '') ||
              `+251${userPhone.number}` === phoneInput ||
              userPhone.formatted?.replace(/\s/g, '') === phoneInput.replace(/\s/g, '')) {
            user = value;
            console.log('‚úÖ Found user by phone object match');
            break;
          }
        } 
        // If userPhone is a string, compare directly
        else if (userPhone === phoneInput || 
                 userPhone.replace(/\s/g, '') === phoneInput.replace(/\s/g, '')) {
          user = value;
          console.log('‚úÖ Found user by phone string match');
          break;
        }
      }

      if (!user) {
        console.log('‚ùå User not found for phone:', phoneInput);
        console.log('Available users:', Array.from(this.users.keys()));
        return {
          success: false
        };
      }

      if (user.password !== password) {
        console.log('‚ùå Invalid password');
        return {
          success: false
        };
      }

      console.log('‚úÖ User authenticated successfully');

      // Generate tokens
      const access_token = this.jwtService.generateAccessToken({
        userId: user.id,
        phone: user.phone,
        role: user.role
      });
      
      const refresh_token = this.jwtService.generateRefreshToken({
        userId: user.id,
        phone: user.phone,
        role: user.role
      });

      const tokens = {
        access_token,
        refresh_token
      };

      return {
        success: true,
        user: {
          id: user.id,
          phone: user.phone,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        },
        tokens: tokens
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false
      };
    }
  }

  async verifyPhone(phone: string, code: string): Promise<boolean> {
    const storedCode = this.verificationCodes.get(phone);
    
    if (storedCode && storedCode === code) {
      this.verificationCodes.delete(phone);
      return true;
    }
    
    return false;
  }

  async refreshToken(refreshToken: string): Promise<{ access_token: string } | null> {
    try {
      const payload = this.jwtService.verifyRefreshToken(refreshToken);
      
      if (!payload) {
        return null;
      }

      const newAccessToken = this.jwtService.generateAccessToken({
        userId: payload.userId,
        phone: payload.phone,
        role: payload.role
      });

      return { access_token: newAccessToken };
    } catch (error) {
      return null;
    }
  }

  async validateUser(phone: string, password: string): Promise<any> {
    // Find user by phone
    for (const [key, user] of this.users.entries()) {
      const userPhone = user.phone;
      
      if (typeof userPhone === 'object') {
        if (userPhone.formatted === phone || 
            userPhone.number === phone.replace('+251', '') ||
            `+251${userPhone.number}` === phone) {
          if (user.password === password) {
            return {
              id: user.id,
              phone: user.phone,
              firstName: user.firstName,
              lastName: user.lastName,
              role: user.role
            };
          }
        }
      } else if (userPhone === phone && user.password === password) {
        return {
          id: user.id,
          phone: user.phone,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        };
      }
    }
    
    return null;
  }
}
