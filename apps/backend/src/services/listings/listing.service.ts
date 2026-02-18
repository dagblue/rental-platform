import { prisma } from '../../services/database.service';
import { CreateListingDto } from '../../dto/listings/create-listing.dto';
import { UpdateListingDto } from '../../dto/listings/update-listing.dto';
import { ListingQueryDto } from '../../dto/listings/listing-query.dto';

// In-memory store for development
const listingStore = new Map();

export class ListingService {
  async createListing(ownerId: string, data: CreateListingDto) {
    const listing = {
      id: Date.now().toString(),
      ownerId,
      ...data,
      status: 'ACTIVE',
      views: 0,
      saves: 0,
      bookingsCount: 0,
      averageRating: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      images: [],
    };

    // Store in memory
    if (!listingStore.has(ownerId)) {
      listingStore.set(ownerId, []);
    }
    listingStore.get(ownerId).push(listing);

    return listing;
  }

  async getListingById(listingId: string) {
    // Search through all listings
    for (const [ownerId, listings] of listingStore.entries()) {
      const found = listings.find((l: any) => l.id === listingId);
      if (found) return found;
    }
    return null;
  }

  async updateListing(listingId: string, ownerId: string, data: UpdateListingDto) {
    const listings = listingStore.get(ownerId) || [];
    const index = listings.findIndex((l: any) => l.id === listingId);

    if (index === -1) {
      throw new Error('Listing not found');
    }

    listings[index] = {
      ...listings[index],
      ...data,
      updatedAt: new Date(),
    };

    return listings[index];
  }

  async deleteListing(listingId: string, ownerId: string) {
    const listings = listingStore.get(ownerId) || [];
    const filtered = listings.filter((l: any) => l.id !== listingId);
    listingStore.set(ownerId, filtered);
    return { success: true };
  }

  async getUserListings(userId: string) {
    return listingStore.get(userId) || [];
  }

  async searchListings(query: ListingQueryDto) {
    let results: any[] = [];

    // Collect all listings
    for (const [ownerId, listings] of listingStore.entries()) {
      results = [...results, ...listings];
    }

    // Apply filters
    if (query.search) {
      const searchLower = query.search.toLowerCase();
      results = results.filter(l => 
        l.title.toLowerCase().includes(searchLower) ||
        l.description.toLowerCase().includes(searchLower)
      );
    }

    if (query.region) {
      results = results.filter(l => l.region === query.region);
    }

    if (query.city) {
      results = results.filter(l => l.city === query.city);
    }

    // Price filters - check if they exist before applying
    if (query.minPrice !== undefined) {
      results = results.filter(l => l.pricePerDay >= (query.minPrice as number));
    }

    if (query.maxPrice !== undefined) {
      results = results.filter(l => l.pricePerDay <= (query.maxPrice as number));
    }

    if (query.condition) {
      results = results.filter(l => l.condition === query.condition);
    }

    if (query.deliveryAvailable !== undefined) {
      results = results.filter(l => l.deliveryAvailable === query.deliveryAvailable);
    }

    // Apply sorting
    if (query.sortBy === 'price') {
      results.sort((a, b) => 
        query.sortOrder === 'asc' ? a.pricePerDay - b.pricePerDay : b.pricePerDay - a.pricePerDay
      );
    } else if (query.sortBy === 'createdAt') {
      results.sort((a, b) => 
        query.sortOrder === 'asc' 
          ? a.createdAt.getTime() - b.createdAt.getTime()
          : b.createdAt.getTime() - a.createdAt.getTime()
      );
    }

    // Pagination
    const start = (query.page - 1) * query.limit;
    const paginatedResults = results.slice(start, start + query.limit);

    return {
      items: paginatedResults,
      total: results.length,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(results.length / query.limit),
    };
  }

  async addListingImage(listingId: string, ownerId: string, imageUrl: string) {
    const listings = listingStore.get(ownerId) || [];
    const listing = listings.find((l: any) => l.id === listingId);

    if (!listing) {
      throw new Error('Listing not found');
    }

    if (!listing.images) {
      listing.images = [];
    }

    const image = {
      id: Date.now().toString(),
      url: imageUrl,
      isPrimary: listing.images.length === 0,
      createdAt: new Date(),
    };

    listing.images.push(image);
    return image;
  }

  async removeListingImage(listingId: string, ownerId: string, imageId: string) {
    const listings = listingStore.get(ownerId) || [];
    const listing = listings.find((l: any) => l.id === listingId);

    if (!listing) {
      throw new Error('Listing not found');
    }

    listing.images = listing.images.filter((img: any) => img.id !== imageId);
    return { success: true };
  }
}
