import { Request, Response, NextFunction } from 'express';

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  
  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'Not authenticated',
    });
  }

  if (user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      error: 'Admin access required',
    });
  }

  next();
};
