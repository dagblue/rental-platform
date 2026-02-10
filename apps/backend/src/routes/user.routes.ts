import { Router } from 'express';
import { UserController } from '../controllers/users/user.controller';
import { UserService } from '../services/users/user.service';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const userService = new UserService();
const userController = new UserController(userService);

// All routes require authentication
router.use(authenticate());

// Profile management
router.get('/profile', (req, res) => userController.getProfile(req, res));
router.put('/profile', (req, res) => userController.updateProfile(req, res));

// Verification
router.post('/verify-id', (req, res) => userController.verifyId(req, res));
router.get('/verification-status', (req, res) => userController.getVerificationStatus(req, res));

// Guarantors
router.post('/guarantors', (req, res) => userController.addGuarantor(req, res));
router.get('/guarantors', (req, res) => userController.getGuarantors(req, res));

export default router;
