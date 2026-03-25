import { Request, Response } from 'express';
import { TrustService } from '../../services/users/trust.service';

const trustService = new TrustService();

export const getTrustData = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated',
      });
    }

    const trustData = await trustService.getTrustData(userId);

    return res.status(200).json({
      success: true,
      data: trustData,
    });
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
};
