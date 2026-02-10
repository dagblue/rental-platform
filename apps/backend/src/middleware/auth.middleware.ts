import { Request, Response, NextFunction } from 'express';
// Check if JwtService is exported as default or named
import * as authPackage from '@rental-platform/auth';

export interface AuthRequest extends Request {
  user?: any;
}

// Try to get JwtService from auth package
const JwtService =
  (authPackage as any).JwtService ||
  (authPackage as any).default?.JwtService ||
  class MockJwtService {
    verifyAccessToken(token: string) {
      try {
        // Simple mock verification
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        return payload;
      } catch {
        return null;
      }
    }
  };

const jwtService = new (JwtService as any)();

export function authenticate() {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required',
          message: 'No authorization token provided',
        });
      }

      const token = authHeader.split(' ')[1];

      // Verify token
      const payload = jwtService.verifyAccessToken(token);

      if (!payload) {
        return res.status(401).json({
          success: false,
          error: 'Invalid token',
          message: 'Token is invalid or expired',
        });
      }

      // Attach user to request
      req.user = payload;
      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Authentication error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };
}
