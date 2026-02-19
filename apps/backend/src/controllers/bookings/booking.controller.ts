import { Request, Response } from 'express';
import { BookingService } from '../../services/bookings/booking.service';
import { createBookingDto, CreateBookingDto } from '../../dto/bookings/create-booking.dto';
import { updateBookingStatusDto, UpdateBookingStatusDto } from '../../dto/bookings/update-booking-status.dto';
import { availabilityQueryDto, AvailabilityQueryDto } from '../../dto/bookings/availability-query.dto';

export class BookingController {
  constructor(private bookingService: BookingService) {}

  async createBooking(req: Request, res: Response) {
    try {
      const renterId = (req as any).user?.userId;
      
      if (!renterId) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated',
        });
      }

      const validatedData: CreateBookingDto = createBookingDto.parse(req.body);
      const booking = await this.bookingService.createBooking(renterId, validatedData);

      return res.status(201).json({
        success: true,
        message: 'Booking request created successfully',
        data: booking,
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

  async getBooking(req: Request, res: Response) {
    try {
      const { bookingId } = req.params;
      const userId = (req as any).user?.userId;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated',
        });
      }

      const booking = await this.bookingService.getBookingById(bookingId);

      if (!booking) {
        return res.status(404).json({
          success: false,
          error: 'Booking not found',
        });
      }

      // Check if user is either the renter or the owner
      // In real app, you'd check if user owns the listing
      if (booking.renterId !== userId && booking.ownerId !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Not authorized to view this booking',
        });
      }

      return res.status(200).json({
        success: true,
        data: booking,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

  async getUserBookings(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      const { role } = req.query;
      
      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated',
        });
      }

      const bookings = await this.bookingService.getUserBookings(
        userId, 
        role === 'owner' ? 'owner' : 'renter'
      );

      return res.status(200).json({
        success: true,
        data: bookings,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

  async updateBookingStatus(req: Request, res: Response) {
    try {
      const ownerId = (req as any).user?.userId;
      const { bookingId } = req.params;

      if (!ownerId) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated',
        });
      }

      const validatedData: UpdateBookingStatusDto = updateBookingStatusDto.parse(req.body);
      const booking = await this.bookingService.updateBookingStatus(
        bookingId, 
        ownerId, 
        validatedData
      );

      const message = 
        booking.status === 'CONFIRMED' ? 'Booking confirmed successfully' :
        booking.status === 'REJECTED' ? 'Booking rejected' :
        'Booking status updated';

      return res.status(200).json({
        success: true,
        message,
        data: booking,
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

  async cancelBooking(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;
      const { bookingId } = req.params;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated',
        });
      }

      const booking = await this.bookingService.cancelBooking(bookingId, userId);

      return res.status(200).json({
        success: true,
        message: 'Booking cancelled successfully',
        data: booking,
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

  async checkAvailability(req: Request, res: Response) {
    try {
      const { listingId } = req.params;
      const validatedQuery: AvailabilityQueryDto = availabilityQueryDto.parse(req.query);

      const availability = await this.bookingService.checkListingAvailability(
        listingId, 
        validatedQuery
      );

      return res.status(200).json({
        success: true,
        data: availability,
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

  async getListingBookings(req: Request, res: Response) {
    try {
      const ownerId = (req as any).user?.userId;
      const { listingId } = req.params;

      if (!ownerId) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated',
        });
      }

      const bookings = await this.bookingService.getListingBookings(listingId, ownerId);

      return res.status(200).json({
        success: true,
        data: bookings,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }

  async getUpcomingBookings(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'Not authenticated',
        });
      }

      const bookings = await this.bookingService.getUpcomingBookings(userId);

      return res.status(200).json({
        success: true,
        data: bookings,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }
}
