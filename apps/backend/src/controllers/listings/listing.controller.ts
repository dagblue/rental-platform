import { Request, Response } from 'express';
import { ListingService } from '../../services/listings/listing.service';
import { createListingDto, CreateListingDto } from '../../dto/listings/create-listing.dto';
import { updateListingDto, UpdateListingDto } from '../../dto/listings/update-listing.dto';
import { listingQueryDto, ListingQueryDto } from '../../dto/listings/listing-query.dto';

export class ListingController {
  constructor(private listingService: ListingService) {}

  async createListing(req: Request, res: Response) {
    try {
      const ownerId = (req as any).user?.userId;
      
      if (!ownerId) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated',
        });
      }

      const validatedData: CreateListingDto = createListingDto.parse(req.body);
      const listing = await this.listingService.createListing(ownerId, validatedData);

      return res.status(201).json({
        success: true,
        message: 'Listing created successfully',
        data: listing,
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

  async getListing(req: Request, res: Response) {
    try {
      const { listingId } = req.params;
      const listing = await this.listingService.getListingById(listingId);

      if (!listing) {
        return res.status(404).json({
          success: false,
          error: 'Listing not found',
        });
      }

      return res.status(200).json({
        success: true,
        data: listing,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

  async updateListing(req: Request, res: Response) {
    try {
      const ownerId = (req as any).user?.userId;
      const { listingId } = req.params;

      if (!ownerId) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated',
        });
      }

      const validatedData: UpdateListingDto = updateListingDto.parse(req.body);
      const listing = await this.listingService.updateListing(listingId, ownerId, validatedData);

      return res.status(200).json({
        success: true,
        message: 'Listing updated successfully',
        data: listing,
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

  async deleteListing(req: Request, res: Response) {
    try {
      const ownerId = (req as any).user?.userId;
      const { listingId } = req.params;

      if (!ownerId) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated',
        });
      }

      await this.listingService.deleteListing(listingId, ownerId);

      return res.status(200).json({
        success: true,
        message: 'Listing deleted successfully',
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

  async getUserListings(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated',
        });
      }

      const listings = await this.listingService.getUserListings(userId);

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

  async searchListings(req: Request, res: Response) {
    try {
      const validatedQuery: ListingQueryDto = listingQueryDto.parse(req.query);
      const results = await this.listingService.searchListings(validatedQuery);

      return res.status(200).json({
        success: true,
        data: results,
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

  async addListingImage(req: Request, res: Response) {
    try {
      const ownerId = (req as any).user?.userId;
      const { listingId } = req.params;

      if (!ownerId) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated',
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No image uploaded',
        });
      }

      const imageUrl = `/uploads/listings/${req.file.filename}`;
      const image = await this.listingService.addListingImage(listingId, ownerId, imageUrl);

      return res.status(201).json({
        success: true,
        message: 'Image added successfully',
        data: image,
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

  async removeListingImage(req: Request, res: Response) {
    try {
      const ownerId = (req as any).user?.userId;
      const { listingId, imageId } = req.params;

      if (!ownerId) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated',
        });
      }

      await this.listingService.removeListingImage(listingId, ownerId, imageId);

      return res.status(200).json({
        success: true,
        message: 'Image removed successfully',
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }
}
