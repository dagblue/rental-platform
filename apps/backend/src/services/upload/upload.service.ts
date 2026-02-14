import fs from 'fs';
import path from 'path';

export class UploadService {
  async uploadFile(file: Express.Multer.File, userId: string, type: string): Promise<string> {
    // For now, just return the local path
    // You can add Cloudinary integration later
    return `/uploads/id-documents/${file.filename}`;
  }

  validateFileSize(file: Express.Multer.File, maxSizeMB: number = 5): boolean {
    return file.size <= maxSizeMB * 1024 * 1024;
  }

  validateFileType(file: Express.Multer.File, allowedTypes: string[]): boolean {
    const ext = path.extname(file.originalname).toLowerCase();
    return allowedTypes.includes(ext);
  }
}
