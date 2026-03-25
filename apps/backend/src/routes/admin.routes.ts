import { Router } from 'express';
import { AdminController } from '../controllers/admin/admin.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/admin.middleware';

const router = Router();
const adminController = new AdminController();

// All admin routes require authentication and admin role
router.use(authenticate());
router.use(requireAdmin);

// Dashboard
router.get('/stats', (req, res) => adminController.getStats(req, res));

// User Management
router.get('/users', (req, res) => adminController.getUsers(req, res));
router.put('/users/:userId/status', (req, res) => adminController.updateUserStatus(req, res));
router.put('/users/:userId/role', (req, res) => adminController.updateUserRole(req, res));

// Listing Management
router.get('/listings', (req, res) => adminController.getListings(req, res));
router.put('/listings/:listingId/status', (req, res) => adminController.updateListingStatus(req, res));

// Review Management
router.get('/reviews', (req, res) => adminController.getReviews(req, res));
router.delete('/reviews/:reviewId', (req, res) => adminController.removeReview(req, res));



export default router;
