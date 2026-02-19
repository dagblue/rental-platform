import { Request, Response } from 'express';
import { ReviewService } from '../../services/reviews/review.service';
import { createReviewDto, CreateReviewDto } from '../../dto/reviews/create-review.dto';
import { updateReviewDto, UpdateReviewDto } from '../../dto/reviews/update-review.dto';
import { reportReviewDto, ReportReviewDto } from '../../dto/reviews/report-review.dto';
import { reviewQueryDto, ReviewQueryDto } from '../../dto/reviews/review-query.dto';

export class ReviewController {
  constructor(private reviewService: ReviewService) {}

  async createReview(req: Request, res: Response) {
    try {
      const reviewerId = (req as any).user?.userId;
      
      if (!reviewerId) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated',
        });
      }

      const validatedData: CreateReviewDto = createReviewDto.parse(req.body);
      const review = await this.reviewService.createReview(reviewerId, validatedData);

      return res.status(201).json({
        success: true,
        message: 'Review created successfully',
        data: review,
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

  async getReviews(req: Request, res: Response) {
    try {
      const { targetId } = req.params;
      const validatedQuery: ReviewQueryDto = reviewQueryDto.parse(req.query);

      const result = await this.reviewService.getReviews(targetId, validatedQuery);

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

  async getRatingStats(req: Request, res: Response) {
    try {
      const { targetId } = req.params;

      const stats = await this.reviewService.getRatingStats(targetId);

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

  async updateReview(req: Request, res: Response) {
    try {
      const reviewerId = (req as any).user?.userId;
      const { reviewId } = req.params;

      if (!reviewerId) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated',
        });
      }

      const validatedData: UpdateReviewDto = updateReviewDto.parse(req.body);
      const review = await this.reviewService.updateReview(reviewId, reviewerId, validatedData);

      return res.status(200).json({
        success: true,
        message: 'Review updated successfully',
        data: review,
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

  async deleteReview(req: Request, res: Response) {
    try {
      const reviewerId = (req as any).user?.userId;
      const { reviewId } = req.params;

      if (!reviewerId) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated',
        });
      }

      await this.reviewService.deleteReview(reviewId, reviewerId);

      return res.status(200).json({
        success: true,
        message: 'Review deleted successfully',
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

  async markHelpful(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      const { reviewId } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated',
        });
      }

      const result = await this.reviewService.markHelpful(reviewId, userId);

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

  async addResponse(req: Request, res: Response) {
    try {
      const ownerId = (req as any).user?.userId;
      const { reviewId } = req.params;
      const { comment } = req.body;

      if (!ownerId) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated',
        });
      }

      if (!comment) {
        return res.status(400).json({
          success: false,
          error: 'Comment is required',
        });
      }

      const response = await this.reviewService.addResponse(reviewId, ownerId, comment);

      return res.status(201).json({
        success: true,
        message: 'Response added successfully',
        data: response,
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

  async reportReview(req: Request, res: Response) {
    try {
      const reporterId = (req as any).user?.userId;
      const { reviewId } = req.params;

      if (!reporterId) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated',
        });
      }

      const validatedData: ReportReviewDto = reportReviewDto.parse(req.body);
      const report = await this.reviewService.reportReview(reviewId, reporterId, validatedData);

      return res.status(201).json({
        success: true,
        message: 'Review reported successfully',
        data: report,
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

  // Admin endpoints
  async resolveReport(req: Request, res: Response) {
    try {
      const adminId = (req as any).user?.userId;
      const { reportId } = req.params;
      const { action } = req.body;

      // In production, check if user is admin
      if (!adminId) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated',
        });
      }

      const result = await this.reviewService.resolveReport(reportId, adminId, action);

      return res.status(200).json({
        success: true,
        message: `Report ${action.toLowerCase()}`,
        data: result,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

  async getUserReviews(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      const validatedQuery: ReviewQueryDto = reviewQueryDto.parse(req.query);

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated',
        });
      }

      const result = await this.reviewService.getUserReviews(userId, validatedQuery);

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }
}
