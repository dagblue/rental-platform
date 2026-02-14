import { Request, Response, NextFunction } from 'express';
import { JwtService } from '@rental-platform/auth'; // Use proper named import

export interface AuthRequest extends Request {
  user?: any;
}

const jwtService = new JwtService();

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
