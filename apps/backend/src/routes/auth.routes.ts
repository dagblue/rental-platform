import { Router } from 'express';
import { AuthController } from '../controllers/auth/auth.controller';
// Note: authenticate middleware doesn't exist in auth package yet
// We'll create our own or import from somewhere else
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// For now, create auth service without dependencies
const authService = new (require('@rental-platform/auth').AuthService)();
const authController = new AuthController(authService);

// Public routes
router.post('/register', (req, res) => authController.register(req, res));
router.post('/login', (req, res) => authController.login(req, res));
router.post('/verify-phone', (req, res) => authController.verifyPhone(req, res));
router.post('/refresh-token', (req, res) => authController.refreshToken(req, res));

// Protected routes - temporarily commented out until middleware works
// router.get('/profile', authenticate(), (req, res) => authController.getProfile(req, res));
router.get('/profile', (req, res) => authController.getProfile(req, res));

export default router;
// Update the profile route to use our middleware
router.get('/profile', authenticate(), (req, res) => authController.getProfile(req, res));
