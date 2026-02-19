import { Router } from 'express';
import { ReviewController } from '../controllers/reviews/review.controller';
import { ReviewService } from '../services/reviews/review.service';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const reviewService = new ReviewService();
const reviewController = new ReviewController(reviewService);

// Public routes (no auth required)
router.get('/target/:targetId', (req, res) => reviewController.getReviews(req, res));
router.get('/target/:targetId/stats', (req, res) => reviewController.getRatingStats(req, res));

// Protected routes
router.use(authenticate());

// Review CRUD
router.post('/', (req, res) => reviewController.createReview(req, res));
router.put('/:reviewId', (req, res) => reviewController.updateReview(req, res));
router.delete('/:reviewId', (req, res) => reviewController.deleteReview(req, res));

// User's own reviews
router.get('/user/me', (req, res) => reviewController.getUserReviews(req, res));

// Interactions
router.post('/:reviewId/helpful', (req, res) => reviewController.markHelpful(req, res));
router.post('/:reviewId/response', (req, res) => reviewController.addResponse(req, res));
router.post('/:reviewId/report', (req, res) => reviewController.reportReview(req, res));

// Admin routes (you might want to add admin middleware)
router.post('/admin/report/:reportId/resolve', (req, res) => reviewController.resolveReport(req, res));

export default router;
