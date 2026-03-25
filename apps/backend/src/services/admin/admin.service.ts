import { prisma } from '../database.service';

export class AdminService {
  // Dashboard Stats
  async getStats() {
    const [
      totalUsers,
      totalListings,
      totalBookings,
      pendingListings
    ] = await Promise.all([
      prisma.user.count(),
      prisma.listing.count(),
      prisma.booking.count(),
      prisma.listing.count({ where: { status: 'PENDING_REVIEW' } }),
    ]);

    // Calculate total revenue from completed bookings - FIXED: totalAmount instead of totalPrice
    const bookings = await prisma.booking.findMany({
      where: { status: 'COMPLETED' },
      select: { totalAmount: true },
    });
    const totalRevenue = bookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

    return {
      totalUsers,
      totalListings,
      totalBookings,
      totalRevenue,
      pendingListings,
      pendingReviews: 0,
      openDisputes: 0,
      recentActivity: await this.getRecentActivity(),
    };
  }

  private async getRecentActivity() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const activity = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));

      const [users, listings, bookings] = await Promise.all([
        prisma.user.count({
          where: { createdAt: { gte: startOfDay, lte: endOfDay } },
        }),
        prisma.listing.count({
          where: { createdAt: { gte: startOfDay, lte: endOfDay } },
        }),
        prisma.booking.count({
          where: { createdAt: { gte: startOfDay, lte: endOfDay } },
        }),
      ]);

      activity.unshift({
        date: startOfDay.toISOString(),
        users,
        listings,
        bookings,
      });
    }

    return activity;
  }

  // User Management
  async getUsers(page: number = 1, limit: number = 10, role?: string, status?: string) {
    const where: any = {};
    if (role) where.role = role;
    if (status) where.status = status;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              listings: true,
              bookingsAsRenter: true,  // FIXED: correct relation names
              bookingsAsOwner: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    const formattedUsers = users.map(user => ({
      id: user.id,
      phone: user.phone,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      trustLevel: user.trustLevel,
      status: user.status || 'ACTIVE',
      createdAt: user.createdAt,
      listingsCount: user._count?.listings || 0,
      bookingsCount: (user._count?.bookingsAsRenter || 0) + (user._count?.bookingsAsOwner || 0),
    }));

    return {
      items: formattedUsers,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateUserStatus(userId: string, status: string, reason?: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { 
        status: status as any,  // Cast to any to avoid enum issues
        ...(reason ? { suspensionReason: reason } : {}),
      },
    });
  }

  async updateUserRole(userId: string, role: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { role: role as any },
    });
  }

  // Listing Management
  async getListings(page: number = 1, limit: number = 10, status?: string) {
    const where: any = {};
    if (status) where.status = status;

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          owner: {
            select: { firstName: true, lastName: true },
          },
          // REMOVED: _count.reports (doesn't exist)
        },
      }),
      prisma.listing.count({ where }),
    ]);

    const formattedListings = listings.map(listing => ({
      id: listing.id,
      ownerId: listing.ownerId,
      ownerName: `${listing.owner.firstName} ${listing.owner.lastName}`,
      title: listing.title,
      pricePerDay: listing.pricePerDay,
      status: listing.status,
      reportsCount: 0,  // Default to 0 since reports don't exist
      views: listing.views || 0,
      createdAt: listing.createdAt,
    }));

    return {
      items: formattedListings,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateListingStatus(listingId: string, status: string) {
    return prisma.listing.update({
      where: { id: listingId },
      data: { 
        status: status as any,
      },
    });
  }

  // Review Management
  async getReviews(page: number = 1, limit: number = 10) {
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          reviewer: {
            select: { firstName: true, lastName: true },
          },
          reviewee: {
            select: { firstName: true, lastName: true },
          },
        },
      }),
      prisma.review.count(),
    ]);

    const formattedReviews = reviews.map(review => ({
      id: review.id,
      reviewerId: review.reviewerId,
      reviewerName: `${review.reviewer.firstName} ${review.reviewer.lastName}`,
      revieweeId: review.revieweeId,
      revieweeName: `${review.reviewee.firstName} ${review.reviewee.lastName}`,
      listingId: review.listingId,
      rating: review.rating,
      comment: review.comment || '',
      reportsCount: 0,  // Default to 0
      status: 'ACTIVE',
      createdAt: review.createdAt,
    }));

    return {
      items: formattedReviews,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async removeReview(reviewId: string) {
    return prisma.review.delete({
      where: { id: reviewId },
    });
  }

  // Reports Management - Commented out since Report model doesn't exist
  /*
  async getReports(page: number = 1, limit: number = 10, type?: string) {
    return {
      items: [],
      total: 0,
      page,
      limit,
      totalPages: 0,
    };
  }

  async resolveReport(reportId: string, action: string, notes?: string) {
    return { success: true };
  }
  */
}