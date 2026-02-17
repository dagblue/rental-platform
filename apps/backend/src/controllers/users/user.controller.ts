import { Request, Response } from 'express';
import { UserService } from '../../services/users/user.service';
import { updateProfileDto, UpdateProfileDto } from '../../dto/users/update-profile.dto';
import { verifyIdDto, VerifyIdDto } from '../../dto/users/verify-id.dto';

export class UserController {
  constructor(private userService: UserService) {}

  async getProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated',
        });
      }

      const user = await this.userService.getProfile(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found',
        });
      }

      return res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

  async updateProfile(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated',
        });
      }

      const validatedData: UpdateProfileDto = updateProfileDto.parse(req.body);

      const updatedUser = await this.userService.updateProfile(userId, validatedData);

      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: updatedUser,
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
  }

  async verifyId(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated',
        });
      }

      const validatedData: VerifyIdDto = verifyIdDto.parse(req.body);

      const verification = await this.userService.requestIdVerification(userId, validatedData);

      return res.status(201).json({
        success: true,
        message: 'ID verification requested successfully',
        data: verification,
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
  }

  async getVerificationStatus(req: Request, res: Response) {
    console.log('Verification status endpoint hit!'); // Add this
    try {
      const userId = (req as any).user?.userId;
      console.log('User ID:', userId); // Add this

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated',
        });
      }

      const verifications = await this.userService.getVerificationStatus(userId);
      console.log('Verifications found:', verifications); // Add this

      return res.status(200).json({
        success: true,
        data: verifications,
      });
    } catch (error) {
      console.error('Error in getVerificationStatus:', error); // Add this
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }
  async addGuarantor(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      const { guarantorPhone, relationship } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated',
        });
      }

      if (!guarantorPhone || !relationship) {
        return res.status(400).json({
          success: false,
          error: 'Guarantor phone and relationship are required',
        });
      }

      // In real app, you'd look up user by phone
      // For now, we'll use a mock
      const guarantorId = 'mock-guarantor-id';

      const guarantor = await this.userService.addGuarantor(userId, guarantorId, relationship);

      return res.status(201).json({
        success: true,
        message: 'Guarantor added successfully',
        data: guarantor,
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
  }

  async getGuarantors(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated',
        });
      }

      const guarantors = await this.userService.getGuarantors(userId);

      return res.status(200).json({
        success: true,
        data: guarantors,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }
}
