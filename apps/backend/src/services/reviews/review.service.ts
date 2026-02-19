import { CreateReviewDto } from '../../dto/reviews/create-review.dto';
import { UpdateReviewDto } from '../../dto/reviews/update-review.dto';
import { ReviewQueryDto } from '../../dto/reviews/review-query.dto';
import { ReportReviewDto } from "../../dto/reviews/report-review.dto";
// In-memory stores
const reviewStore = new Map<string, Review[]>(); // targetId -> reviews[]
const userReviewStore = new Map<string, Review[]>(); // userId -> reviews written
const reportStore = new Map<string, Report[]>(); // reviewId -> reports
const helpfulStore = new Map<string, Set<string>>(); // reviewId -> userIds who found helpful

interface Review {
  id: string;
  bookingId: string;
  reviewerId: string;
  reviewerName?: string;
  targetId: string;
  targetType: 'USER' | 'LISTING';
  rating: number;
  comment: string;
  pros: string[];
  cons: string[];
  images: string[];
  isAnonymous: boolean;
  verified: boolean; // Was this from a confirmed booking?
  helpful: number; // Count of users who found this helpful
  response?: ReviewResponse;
  createdAt: Date;
  updatedAt: Date;
}

interface ReviewResponse {
  id: string;
  reviewerId: string;
  comment: string;
  createdAt: Date;
}

interface Report {
  id: string;
  reviewId: string;
  reporterId: string;
  reason: string;
  description?: string;
  status: 'PENDING' | 'RESOLVED' | 'REJECTED';
  createdAt: Date;
  resolvedAt?: Date;
  resolvedBy?: string;
}

interface RatingStats {
  targetId: string;
  targetType: 'USER' | 'LISTING';
  averageRating: number;
  totalReviews: number;
  distribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  recentTrend: number; // Change in last 30 days
  verifiedPercentage: number;
}

export class ReviewService {
  // Calculate weighted rating (more weight to recent reviews)
  private calculateWeightedRating(reviews: Review[]): number {
    if (reviews.length === 0) return 0;
    
    const now = new Date();
    let totalWeight = 0;
    let weightedSum = 0;
    
    reviews.forEach(review => {
      const daysOld = (now.getTime() - review.createdAt.getTime()) / (1000 * 60 * 60 * 24);
      // Weight decreases as review gets older (max weight 1.0, min 0.1)
      const weight = Math.max(0.1, 1 - (daysOld / 365));
      
      weightedSum += review.rating * weight;
      totalWeight += weight;
    });
    
    return Number((weightedSum / totalWeight).toFixed(1));
  }

  // Get rating distribution
  private getDistribution(reviews: Review[]): { 1: number; 2: number; 3: number; 4: number; 5: number } {
    const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviews.forEach(r => dist[r.rating as keyof typeof dist]++);
    return dist;
  }

  // Calculate recent trend (last 30 days vs previous 30 days)
  private calculateRecentTrend(reviews: Review[]): number {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));
    const sixtyDaysAgo = new Date(now.setDate(now.getDate() - 60));
    
    const recent = reviews.filter(r => r.createdAt > thirtyDaysAgo);
    const previous = reviews.filter(r => 
      r.createdAt <= thirtyDaysAgo && r.createdAt > sixtyDaysAgo
    );
    
    const recentAvg = recent.length ? recent.reduce((s, r) => s + r.rating, 0) / recent.length : 0;
    const previousAvg = previous.length ? previous.reduce((s, r) => s + r.rating, 0) / previous.length : 0;
    
    return Number((recentAvg - previousAvg).toFixed(1));
  }

  async createReview(reviewerId: string, data: CreateReviewDto) {
    // Check if already reviewed
    const existingReviews = reviewStore.get(data.targetId) || [];
    const alreadyReviewed = existingReviews.find(
      r => r.bookingId === data.bookingId && r.reviewerId === reviewerId
    );

    if (alreadyReviewed) {
      throw new Error('You have already reviewed this booking');
    }

    // Get reviewer info (in production, fetch from user service)
    const reviewerName = data.isAnonymous ? 'Anonymous' : `User_${reviewerId.substring(0, 6)}`;

    const review: Review = {
      id: `REV-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      bookingId: data.bookingId,
      reviewerId,
      reviewerName,
      targetId: data.targetId,
      targetType: data.targetType,
      rating: data.rating,
      comment: data.comment,
      pros: data.pros || [],
      cons: data.cons || [],
      images: data.images || [],
      isAnonymous: data.isAnonymous,
      verified: true, // In production, check if booking was completed
      helpful: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Store review
    if (!reviewStore.has(data.targetId)) {
      reviewStore.set(data.targetId, []);
    }
    reviewStore.get(data.targetId)!.push(review);

    if (!userReviewStore.has(reviewerId)) {
      userReviewStore.set(reviewerId, []);
    }
    userReviewStore.get(reviewerId)!.push(review);

    // Update trust score (will be implemented later)
    await this.updateTrustScore(review.targetId, review.targetType);

    return review;
  }

  async getReviews(targetId: string, query: ReviewQueryDto) {
    const allReviews = reviewStore.get(targetId) || [];
    
    // Apply filters
    let filtered = [...allReviews];

    if (query.minRating) {
      filtered = filtered.filter(r => r.rating >= query.minRating!);
    }

    if (query.hasImages) {
      filtered = filtered.filter(r => r.images.length > 0);
    }

    if (query.verified) {
      filtered = filtered.filter(r => r.verified);
    }

    // Apply sorting
    if (query.sortBy === 'rating') {
      filtered.sort((a, b) => 
        query.sortOrder === 'asc' ? a.rating - b.rating : b.rating - a.rating
      );
    } else if (query.sortBy === 'helpful') {
      filtered.sort((a, b) => 
        query.sortOrder === 'asc' ? a.helpful - b.helpful : b.helpful - a.helpful
      );
    } else {
      filtered.sort((a, b) => 
        query.sortOrder === 'asc' 
          ? a.createdAt.getTime() - b.createdAt.getTime()
          : b.createdAt.getTime() - a.createdAt.getTime()
      );
    }

    // Pagination
    const start = (query.page - 1) * query.limit;
    const paginated = filtered.slice(start, start + query.limit);

    // Get rating stats
    const stats = await this.getRatingStats(targetId);

    return {
      items: paginated,
      total: filtered.length,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(filtered.length / query.limit),
      stats,
    };
  }

  async getRatingStats(targetId: string): Promise<RatingStats> {
    const reviews = reviewStore.get(targetId) || [];
    
    if (reviews.length === 0) {
      return {
        targetId,
        targetType: 'LISTING', // Will be set correctly by caller
        averageRating: 0,
        totalReviews: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        recentTrend: 0,
        verifiedPercentage: 0,
      };
    }

    const averageRating = this.calculateWeightedRating(reviews);
    const distribution = this.getDistribution(reviews);
    const recentTrend = this.calculateRecentTrend(reviews);
    const verifiedCount = reviews.filter(r => r.verified).length;
    const verifiedPercentage = (verifiedCount / reviews.length) * 100;

    return {
      targetId,
      targetType: reviews[0].targetType,
      averageRating,
      totalReviews: reviews.length,
      distribution,
      recentTrend,
      verifiedPercentage,
    };
  }

  async updateReview(reviewId: string, reviewerId: string, data: UpdateReviewDto) {
    // Find the review
    let foundReview: Review | null = null;
    let targetId = '';

    for (const [tid, reviews] of reviewStore.entries()) {
      const review = reviews.find(r => r.id === reviewId);
      if (review) {
        foundReview = review;
        targetId = tid;
        break;
      }
    }

    if (!foundReview) {
      throw new Error('Review not found');
    }

    if (foundReview.reviewerId !== reviewerId) {
      throw new Error('Not authorized to update this review');
    }

    // Update review
    Object.assign(foundReview, data);
    foundReview.updatedAt = new Date();

    return foundReview;
  }

  async deleteReview(reviewId: string, reviewerId: string) {
    // Find and delete review
    for (const [targetId, reviews] of reviewStore.entries()) {
      const index = reviews.findIndex(r => r.id === reviewId);
      if (index !== -1) {
        if (reviews[index].reviewerId !== reviewerId) {
          throw new Error('Not authorized to delete this review');
        }
        reviews.splice(index, 1);
        break;
      }
    }

    // Remove from user store
    for (const [userId, reviews] of userReviewStore.entries()) {
      const index = reviews.findIndex(r => r.id === reviewId);
      if (index !== -1) {
        reviews.splice(index, 1);
        break;
      }
    }

    return { success: true };
  }

  async markHelpful(reviewId: string, userId: string) {
    if (!helpfulStore.has(reviewId)) {
      helpfulStore.set(reviewId, new Set());
    }

    const helpfulUsers = helpfulStore.get(reviewId)!;
    
    if (helpfulUsers.has(userId)) {
      // Unmark helpful
      helpfulUsers.delete(userId);
    } else {
      // Mark helpful
      helpfulUsers.add(userId);
    }

    // Update review helpful count
    for (const reviews of reviewStore.values()) {
      const review = reviews.find(r => r.id === reviewId);
      if (review) {
        review.helpful = helpfulUsers.size;
        break;
      }
    }

    return { helpful: helpfulUsers.size };
  }

  async addResponse(reviewId: string, ownerId: string, comment: string) {
    // Find the review
    for (const reviews of reviewStore.values()) {
      const review = reviews.find(r => r.id === reviewId);
      if (review) {
        // In production, verify ownerId owns the listing/user being reviewed
        review.response = {
          id: `RES-${Date.now()}`,
          reviewerId: ownerId,
          comment,
          createdAt: new Date(),
        };
        return review.response;
      }
    }
    throw new Error('Review not found');
  }

  async reportReview(reviewId: string, reporterId: string, data: ReportReviewDto) {
    // Check if already reported by this user
    const existingReports = reportStore.get(reviewId) || [];
    const alreadyReported = existingReports.find(r => r.reporterId === reporterId);

    if (alreadyReported) {
      throw new Error('You have already reported this review');
    }

    const report: Report = {
      id: `REP-${Date.now()}`,
      reviewId,
      reporterId,
      reason: data.reason,
      description: data.description,
      status: 'PENDING',
      createdAt: new Date(),
    };

    if (!reportStore.has(reviewId)) {
      reportStore.set(reviewId, []);
    }
    reportStore.get(reviewId)!.push(report);

    return report;
  }

  // Admin functions
  async resolveReport(reportId: string, adminId: string, action: 'RESOLVED' | 'REJECTED') {
    for (const [reviewId, reports] of reportStore.entries()) {
      const report = reports.find(r => r.id === reportId);
      if (report) {
        report.status = action;
        report.resolvedAt = new Date();
        report.resolvedBy = adminId;

        // If resolved, maybe remove the review
        if (action === 'RESOLVED') {
          // Remove the review
          const reviews = reviewStore.get(reviewId) || [];
          const index = reviews.findIndex(r => r.id === reviewId);
          if (index !== -1) {
            reviews.splice(index, 1);
          }
        }
        break;
      }
    }
    return { success: true };
  }

  async getUserReviews(userId: string, query: ReviewQueryDto) {
    const reviews = userReviewStore.get(userId) || [];
    
    // Apply filters and pagination similar to getReviews
    // (simplified for brevity)
    
    return {
      items: reviews,
      total: reviews.length,
      page: query.page,
      limit: query.limit,
    };
  }

  // Trust score integration
  private async updateTrustScore(targetId: string, targetType: string) {
    // This will be implemented when we integrate with User Management
    // For now, just log
    console.log(`��� Updating trust score for ${targetType} ${targetId}`);
    
    // In production:
    // 1. Get all reviews for this target
    // 2. Calculate average rating
    // 3. Update user's trust score
    // 4. Adjust trust level if needed
  }
}
