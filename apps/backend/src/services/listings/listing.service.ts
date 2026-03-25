import { prisma } from '../../services/database.service';
import { CreateListingDto } from '../../dto/listings/create-listing.dto';
import { UpdateListingDto } from '../../dto/listings/update-listing.dto';
import { ListingQueryDto } from '../../dto/listings/listing-query.dto';

export class ListingService {
  async createListing(ownerId: string, data: CreateListingDto) {
    const listing = await prisma.listing.create({
      data: {
        ownerId,
        categoryId: data.categoryId,
        title: data.title,
        slug: data.title.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
        description: data.description,
        shortDescription: data.description.substring(0, 100),
        pricePerDay: data.pricePerDay,
        pricePerWeek: data.pricePerWeek,
        pricePerMonth: data.pricePerMonth,
        currency: data.currency,
        minimumRentalDays: data.minimumRentalDays,
        maximumRentalDays: data.maximumRentalDays,
        locationRegion: data.region,
        locationCity: data.city,
        locationSubcity: data.subcity,
        locationWoreda: data.woreda,
        locationKebele: data.kebele,
        locationFormatted: `${data.city}, ${data.region}, Ethiopia`,
        isExactLocation: false,
        condition: data.condition as any,
        brand: data.brand,
        model: data.model,
        yearOfManufacture: data.yearOfManufacture,
        specifications: {},
        availabilityType: 'CALENDAR' as any,
        advanceNoticeHours: 24,
        sameDayBooking: false,
        instantBooking: false,
        minTrustLevel: data.minTrustLevel as any,
        requiresGuarantors: data.requiresGuarantor ? 1 : 0,
        requiresIdVerification: data.requiresIdVerification,
        requiresDeposit: data.requiresDeposit,
        deliveryAvailable: data.deliveryAvailable,
        deliveryFee: data.deliveryFee,
        pickupRequired: data.pickupRequired,
        rules: data.rules || [],
        cancellationPolicy: data.cancellationPolicy as any,
        status: 'ACTIVE' as any,
        publishedAt: new Date(),
      }
    });
    return listing;
  }

  async getListingById(listingId: string) {
    return prisma.listing.findUnique({
      where: { id: listingId },
      include: {
        listingImages: true,  // ← Changed from 'images' to 'listingImages'
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            phone: true,
            trustLevel: true,
          }
        }
      }
    });
  }

  async updateListing(listingId: string, ownerId: string, data: UpdateListingDto) {
    return prisma.listing.update({
      where: { id: listingId, ownerId },
      data: {
        title: data.title,
        description: data.description,
        pricePerDay: data.pricePerDay,
        pricePerWeek: data.pricePerWeek,
        pricePerMonth: data.pricePerMonth,
        minimumRentalDays: data.minimumRentalDays,
        maximumRentalDays: data.maximumRentalDays,
        locationRegion: data.region,
        locationCity: data.city,
        locationSubcity: data.subcity,
        locationWoreda: data.woreda,
        locationKebele: data.kebele,
        condition: data.condition as any,
        brand: data.brand,
        model: data.model,
        yearOfManufacture: data.yearOfManufacture,
        minTrustLevel: data.minTrustLevel as any,
        requiresIdVerification: data.requiresIdVerification,
        requiresDeposit: data.requiresDeposit,
        deliveryAvailable: data.deliveryAvailable,
        deliveryFee: data.deliveryFee,
        pickupRequired: data.pickupRequired,
        rules: data.rules,
        cancellationPolicy: data.cancellationPolicy as any,
      }
    });
  }

  async deleteListing(listingId: string, ownerId: string) {
    await prisma.listing.delete({
      where: { id: listingId, ownerId }
    });
    return { success: true };
  }

  async getUserListings(userId: string) {
    return prisma.listing.findMany({
      where: { ownerId: userId },
      include: {
        listingImages: true,  // ← Changed from 'images' to 'listingImages'
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async searchListings(query: ListingQueryDto) {
    const where: any = {
      status: 'ACTIVE'
    };

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } }
      ];
    }

    if (query.region) {
      where.locationRegion = query.region;
    }

    if (query.city) {
      where.locationCity = query.city;
    }

    if (query.minPrice !== undefined) {
      where.pricePerDay = { gte: query.minPrice };
    }

    if (query.maxPrice !== undefined) {
      where.pricePerDay = { ...where.pricePerDay, lte: query.maxPrice };
    }

    if (query.condition) {
      where.condition = query.condition as any;
    }

    if (query.deliveryAvailable !== undefined) {
      where.deliveryAvailable = query.deliveryAvailable;
    }

    let orderBy: any = {};
    if (query.sortBy === 'price') {
      orderBy = { pricePerDay: query.sortOrder === 'asc' ? 'asc' : 'desc' };
    } else if (query.sortBy === 'createdAt') {
      orderBy = { createdAt: query.sortOrder === 'asc' ? 'asc' : 'desc' };
    } else {
      orderBy = { createdAt: 'desc' };
    }

    const [items, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        include: {
          listingImages: true,  // ← Changed from 'images' to 'listingImages'
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              trustLevel: true,
            }
          }
        },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
        orderBy,
      }),
      prisma.listing.count({ where })
    ]);

    return {
      items,
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(total / query.limit),
    };
  }

  async addListingImage(listingId: string, ownerId: string, imageUrl: string) {
    const existingImages = await prisma.listingImage.count({
      where: { listingId }
    });

    return prisma.listingImage.create({
      data: {
        listingId,
        url: imageUrl,
        thumbnailUrl: imageUrl,
        isPrimary: existingImages === 0,
        order: existingImages,
        verified: true,
      }
    });
  }

  async removeListingImage(listingId: string, ownerId: string, imageId: string) {
    await prisma.listingImage.delete({
      where: { id: imageId, listingId }
    });
    return { success: true };
  }
}
