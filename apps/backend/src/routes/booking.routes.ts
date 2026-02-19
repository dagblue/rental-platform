import { Router } from 'express';
import { BookingController } from '../controllers/bookings/booking.controller';
import { BookingService } from '../services/bookings/booking.service';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const bookingService = new BookingService();
const bookingController = new BookingController(bookingService);

// Public route (no auth required)
router.get('/availability/:listingId', (req, res) => 
  bookingController.checkAvailability(req, res)
);

// All other routes require authentication
router.use(authenticate());

// Create booking
router.post('/', (req, res) => bookingController.createBooking(req, res));

// Get user's bookings (as renter or owner)
router.get('/user', (req, res) => bookingController.getUserBookings(req, res));
router.get('/upcoming', (req, res) => bookingController.getUpcomingBookings(req, res));

// Get listing's bookings (for owners)
router.get('/listing/:listingId', (req, res) => 
  bookingController.getListingBookings(req, res)
);

// Single booking operations
router.get('/:bookingId', (req, res) => bookingController.getBooking(req, res));
router.put('/:bookingId/status', (req, res) => 
  bookingController.updateBookingStatus(req, res)
);
router.post('/:bookingId/cancel', (req, res) => 
  bookingController.cancelBooking(req, res)
);

export default router;
