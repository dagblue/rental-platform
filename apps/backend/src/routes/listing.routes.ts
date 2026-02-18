import { Router } from 'express';
import { ListingController } from '../controllers/listings/listing.controller';
import { ListingService } from '../services/listings/listing.service';
import { authenticate } from '../middleware/auth.middleware';
import { upload } from '../config/upload/multer.config';

const router = Router();
const listingService = new ListingService();
const listingController = new ListingController(listingService);

// Public routes (no authentication required)
router.get('/search', (req, res) => listingController.searchListings(req, res));
router.get('/:listingId', (req, res) => listingController.getListing(req, res));

// Protected routes (require authentication)
router.use(authenticate());

// CRUD operations
router.post('/', (req, res) => listingController.createListing(req, res));
router.get('/user/me', (req, res) => listingController.getUserListings(req, res));
router.put('/:listingId', (req, res) => listingController.updateListing(req, res));
router.delete('/:listingId', (req, res) => listingController.deleteListing(req, res));

// Image management
router.post(
  '/:listingId/images',
  upload.single('image'),
  (req, res) => listingController.addListingImage(req, res)
);
router.delete(
  '/:listingId/images/:imageId',
  (req, res) => listingController.removeListingImage(req, res)
);

export default router;
