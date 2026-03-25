import { Request, Response } from 'express';
import { AdminService } from '../../services/admin/admin.service';

const adminService = new AdminService();

export class AdminController {
  // Dashboard
  async getStats(req: Request, res: Response) {
    try {
      const stats = await adminService.getStats();
      return res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

  // User Management
  async getUsers(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const role = req.query.role as string;
      const status = req.query.status as string;

      const users = await adminService.getUsers(page, limit, role, status);

      return res.status(200).json({
        success: true,
        data: users,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

  async updateUserStatus(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { status, reason } = req.body;

      await adminService.updateUserStatus(userId, status, reason);

      return res.status(200).json({
        success: true,
        message: 'User status updated',
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

  async updateUserRole(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { role } = req.body;

      await adminService.updateUserRole(userId, role);

      return res.status(200).json({
        success: true,
        message: 'User role updated',
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

  // Listing Management
  async getListings(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as string;

      const listings = await adminService.getListings(page, limit, status);

      return res.status(200).json({
        success: true,
        data: listings,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

  async updateListingStatus(req: Request, res: Response) {
    try {
      const { listingId } = req.params;
      const { status } = req.body;  // REMOVED: reason (not in service)

      await adminService.updateListingStatus(listingId, status);

      return res.status(200).json({
        success: true,
        message: 'Listing status updated',
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

  // Review Management
  async getReviews(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      // REMOVED: status parameter (not in service)

      const reviews = await adminService.getReviews(page, limit);

      return res.status(200).json({
        success: true,
        data: reviews,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

  async removeReview(req: Request, res: Response) {
    try {
      const { reviewId } = req.params;
      // REMOVED: reason parameter (not in service)

      await adminService.removeReview(reviewId);

      return res.status(200).json({
        success: true,
        message: 'Review removed',
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

  // Reports Management - Commented out since service methods don't exist
  /*
  async getReports(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const type = req.query.type as string;

      const reports = await adminService.getReports(page, limit, type);

      return res.status(200).json({
        success: true,
        data: reports,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

  async resolveReport(req: Request, res: Response) {
    try {
      const { reportId } = req.params;
      const { action, notes } = req.body;

      await adminService.resolveReport(reportId, action, notes);

      return res.status(200).json({
        success: true,
        message: 'Report resolved',
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }
  */
}