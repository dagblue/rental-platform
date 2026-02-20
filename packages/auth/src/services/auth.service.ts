import { JwtService } from './jwt.service';
import { prisma } from '@rental-platform/database';

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export interface User {
  id: string;
  phone: any;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
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
  private useDatabase: boolean;

  constructor(
    private jwtService: JwtService,
    useDatabase?: boolean  // Accept config as parameter
  ) {
    this.useDatabase = useDatabase ?? true; // Default to true if not provided
  }

  async register(userData: any): Promise<RegisterResult> {
    try {
      const phoneKey = typeof userData.phone === 'object' 
        ? userData.phone.formatted || userData.phone.number 
        : userData.phone;

      if (this.useDatabase) {
        // DATABASE MODE
        const existingUser = await prisma.user.findUnique({
          where: { phone: phoneKey }
        });

        if (existingUser) {
          return { success: false };
        }

        const newUser = await prisma.user.create({
          data: {
            phone: phoneKey,
            email: userData.email || null,
            firstName: userData.firstName || null,
            lastName: userData.lastName || null,
            passwordHash: userData.password,
            role: 'RENTER',
          },
        });

        const tokens = {
          access_token: this.jwtService.generateAccessToken({
            userId: newUser.id,
            phone: phoneKey,
            role: newUser.role
          }),
          refresh_token: this.jwtService.generateRefreshToken({
            userId: newUser.id,
            phone: phoneKey,
            role: newUser.role
          })
        };

        return {
          success: true,
          user: {
            id: newUser.id,
            phone: userData.phone,
            email: newUser.email,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            role: newUser.role
          },
          tokens
        };
      } else {
        // MEMORY MODE
        if (this.users.has(phoneKey)) {
          return { success: false };
        }

        const newUser = {
          id: Date.now().toString(),
          phone: userData.phone,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: 'RENTER',
          createdAt: new Date()
        };

        this.users.set(phoneKey, {
          ...newUser,
          password: userData.password
        });

        const tokens = {
          access_token: this.jwtService.generateAccessToken({
            userId: newUser.id,
            phone: userData.phone,
            role: newUser.role
          }),
          refresh_token: this.jwtService.generateRefreshToken({
            userId: newUser.id,
            phone: userData.phone,
            role: newUser.role
          })
        };

        return {
          success: true,
          user: newUser,
          tokens
        };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false };
    }
  }

  async login(phoneInput: string, password: string, deviceId?: string): Promise<LoginResult> {
    try {
      if (this.useDatabase) {
        // DATABASE MODE
        const user = await prisma.user.findUnique({
          where: { phone: phoneInput }
        });

        if (!user || user.passwordHash !== password) {
          return { success: false };
        }

        const tokens = {
          access_token: this.jwtService.generateAccessToken({
            userId: user.id,
            phone: phoneInput,
            role: user.role
          }),
          refresh_token: this.jwtService.generateRefreshToken({
            userId: user.id,
            phone: phoneInput,
            role: user.role
          })
        };

        return {
          success: true,
          user: {
            id: user.id,
            phone: phoneInput,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role
          },
          tokens
        };
      } else {
        // MEMORY MODE
        let user = null;
        for (const [key, value] of this.users.entries()) {
          const userPhone = value.phone;
          if (typeof userPhone === 'object') {
            if (userPhone.formatted === phoneInput || 
                userPhone.number === phoneInput.replace('+251', '') ||
                `+251${userPhone.number}` === phoneInput) {
              user = value;
              break;
            }
          } else if (userPhone === phoneInput) {
            user = value;
            break;
          }
        }

        if (!user || user.password !== password) {
          return { success: false };
        }

        const tokens = {
          access_token: this.jwtService.generateAccessToken({
            userId: user.id,
            phone: user.phone,
            role: user.role
          }),
          refresh_token: this.jwtService.generateRefreshToken({
            userId: user.id,
            phone: user.phone,
            role: user.role
          })
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
          tokens
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false };
    }
  }

  async validateUser(phone: string, password: string): Promise<any> {
    if (this.useDatabase) {
      const user = await prisma.user.findUnique({
        where: { phone }
      });
      
      if (user && user.passwordHash === password) {
        return {
          id: user.id,
          phone: user.phone,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        };
      }
    } else {
      for (const [key, user] of this.users.entries()) {
        const userPhone = typeof user.phone === 'object' ? user.phone.formatted : user.phone;
        if (userPhone === phone && user.password === password) {
          return {
            id: user.id,
            phone: user.phone,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role
          };
        }
      }
    }
    return null;
  }

  async verifyPhone(phone: string, code: string): Promise<boolean> {
    const storedCode = this.verificationCodes.get(phone);
    
    if (storedCode && storedCode === code) {
      this.verificationCodes.delete(phone);
      
      if (this.useDatabase) {
        await prisma.user.update({
          where: { phone },
          data: { phoneVerified: true }
        }).catch(err => console.error('Error updating verification status:', err));
      }
      
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
}
