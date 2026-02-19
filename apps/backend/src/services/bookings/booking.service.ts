import { CreateBookingDto } from '../../dto/bookings/create-booking.dto';
import { UpdateBookingStatusDto } from '../../dto/bookings/update-booking-status.dto';
import { AvailabilityQueryDto } from '../../dto/bookings/availability-query.dto';

// In-memory stores for development
const bookingStore = new Map(); // listingId -> bookings[]
const userBookingsStore = new Map(); // userId -> bookings[]

export class BookingService {
  // Calculate total price including Ethiopian taxes
  private calculateTotalPrice(pricePerDay: number, days: number): number {
    const subtotal = pricePerDay * days;
    const tax = subtotal * 0.15; // 15% VAT in Ethiopia
    const serviceFee = subtotal * 0.05; // 5% platform fee
    return subtotal + tax + serviceFee;
  }

  // Check if dates are available
  private async checkAvailability(
    listingId: string, 
    startDate: Date, 
    endDate: Date, 
    excludeBookingId?: string
  ): Promise<boolean> {
    const bookings = bookingStore.get(listingId) || [];
    
    // Filter out the current booking if updating
    const otherBookings = excludeBookingId 
      ? bookings.filter((b: any) => b.id !== excludeBookingId)
      : bookings;

    // Check for overlapping dates
    for (const booking of otherBookings) {
      if (booking.status === 'CONFIRMED' || booking.status === 'PENDING') {
        const bookingStart = new Date(booking.startDate);
        const bookingEnd = new Date(booking.endDate);
        
        // Check if dates overlap
        if (startDate < bookingEnd && endDate > bookingStart) {
          return false; // Dates are not available
        }
      }
    }
    
    return true;
  }

  async createBooking(renterId: string, data: CreateBookingDto) {
    // Validate dates
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    
    if (startDate >= endDate) {
      throw new Error('End date must be after start date');
    }
    
    if (startDate < new Date()) {
      throw new Error('Start date cannot be in the past');
    }

    // Check availability
    const isAvailable = await this.checkAvailability(data.listingId, startDate, endDate);
    if (!isAvailable) {
      throw new Error('Listing is not available for the selected dates');
    }

    // Calculate days and price
    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // In real app, you'd get the listing price from the listing service
    const mockPricePerDay = 1500; // This would come from the listing
    const totalPrice = this.calculateTotalPrice(mockPricePerDay, days);

    // Create booking
    const booking = {
      id: Date.now().toString(),
      listingId: data.listingId,
      renterId,
      startDate,
      endDate,
      days,
      totalPrice,
      status: 'PENDING',
      renterNotes: data.renterNotes,
      numberOfGuests: data.numberOfGuests,
      specialRequirements: data.specialRequirements || [],
      needsGuarantor: data.needsGuarantor,
      guarantorPhone: data.guarantorPhone,
      paymentMethod: data.paymentMethod,
      mobileMoneyProvider: data.mobileMoneyProvider,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Store booking
    if (!bookingStore.has(data.listingId)) {
      bookingStore.set(data.listingId, []);
    }
    bookingStore.get(data.listingId).push(booking);

    if (!userBookingsStore.has(renterId)) {
      userBookingsStore.set(renterId, []);
    }
    userBookingsStore.get(renterId).push(booking);

    return booking;
  }

  async getBookingById(bookingId: string) {
    // Search through all bookings
    for (const [listingId, bookings] of bookingStore.entries()) {
      const found = bookings.find((b: any) => b.id === bookingId);
      if (found) return found;
    }
    return null;
  }

  async getUserBookings(userId: string, role: 'renter' | 'owner') {
    if (role === 'renter') {
      return userBookingsStore.get(userId) || [];
    } else {
      // For owners, we need to find bookings for their listings
      // This is simplified - in real app you'd query by listing owner
      const ownerBookings: any[] = [];
      for (const [listingId, bookings] of bookingStore.entries()) {
        ownerBookings.push(...bookings);
      }
      return ownerBookings.filter((b: any) => b.ownerId === userId);
    }
  }

  async updateBookingStatus(
    bookingId: string, 
    ownerId: string, 
    data: UpdateBookingStatusDto
  ) {
    const booking = await this.getBookingById(bookingId);
    
    if (!booking) {
      throw new Error('Booking not found');
    }

    // In real app, verify that the owner owns the listing
    // For now, we'll just update
    booking.status = data.status;
    booking.updatedAt = new Date();
    
    if (data.reason) {
      booking.rejectionReason = data.reason;
    }
    
    if (data.message) {
      booking.ownerMessage = data.message;
    }

    return booking;
  }

  async cancelBooking(bookingId: string, userId: string) {
    const booking = await this.getBookingById(bookingId);
    
    if (!booking) {
      throw new Error('Booking not found');
    }

    if (booking.renterId !== userId) {
      throw new Error('Not authorized to cancel this booking');
    }

    if (booking.status !== 'PENDING' && booking.status !== 'CONFIRMED') {
      throw new Error('Booking cannot be cancelled');
    }

    booking.status = 'CANCELLED';
    booking.updatedAt = new Date();

    return booking;
  }

  async checkListingAvailability(
    listingId: string, 
    query: AvailabilityQueryDto
  ) {
    const startDate = new Date(query.startDate);
    const endDate = new Date(query.endDate);
    
    const isAvailable = await this.checkAvailability(listingId, startDate, endDate);
    
    return {
      listingId,
      startDate: query.startDate,
      endDate: query.endDate,
      available: isAvailable,
    };
  }

  async getListingBookings(listingId: string, ownerId: string) {
    // In real app, verify owner
    return bookingStore.get(listingId) || [];
  }

  async getUpcomingBookings(userId: string) {
    const bookings = userBookingsStore.get(userId) || [];
    const now = new Date();
    
    return bookings.filter((b: any) => 
      new Date(b.startDate) > now && 
      (b.status === 'CONFIRMED' || b.status === 'PENDING')
    );
  }
}
