import { Request, Response } from 'express';
import { UploadService } from '../../services/upload/upload.service';

export class UploadController {
  constructor(private uploadService: UploadService) {}

  async uploadIdDocument(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      const { type } = req.params; // front, back, selfie

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated',
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No file uploaded',
        });
      }

      const allowedTypes = ['front', 'back', 'selfie'];
      if (!allowedTypes.includes(type)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid document type',
        });
      }

      // Validate file
      const maxSizeMB = 5;
      if (!this.uploadService.validateFileSize(req.file, maxSizeMB)) {
        return res.status(400).json({
          success: false,
          error: `File size exceeds ${maxSizeMB}MB limit`,
        });
      }

      const allowedFileTypes = ['.jpg', '.jpeg', '.png', '.pdf'];
      if (!this.uploadService.validateFileType(req.file, allowedFileTypes)) {
        return res.status(400).json({
          success: false,
          error: 'Only JPG, PNG, and PDF files are allowed',
        });
      }

      // Upload file
      const fileUrl = await this.uploadService.uploadFile(req.file, userId, `id-documents/${type}`);

      return res.status(200).json({
        success: true,
        message: 'File uploaded successfully',
        data: {
          url: fileUrl,
          type: type,
          filename: req.file.originalname,
          size: req.file.size,
        },
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

  async uploadProfilePicture(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated',
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No file uploaded',
        });
      }

      // Validate file
      const maxSizeMB = 2;
      if (!this.uploadService.validateFileSize(req.file, maxSizeMB)) {
        return res.status(400).json({
          success: false,
          error: `File size exceeds ${maxSizeMB}MB limit`,
        });
      }

      const allowedFileTypes = ['.jpg', '.jpeg', '.png'];
      if (!this.uploadService.validateFileType(req.file, allowedFileTypes)) {
        return res.status(400).json({
          success: false,
          error: 'Only JPG and PNG files are allowed for profile pictures',
        });
      }

      // Upload file
      const fileUrl = await this.uploadService.uploadFile(req.file, userId, 'profile-pictures');

      return res.status(200).json({
        success: true,
        message: 'Profile picture uploaded successfully',
        data: {
          url: fileUrl,
          filename: req.file.originalname,
          size: req.file.size,
        },
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
}
