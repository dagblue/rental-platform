import { Router } from 'express';
import { AuthController } from '../controllers/auth/auth.controller';
import { AuthService, JwtService } from '@rental-platform/auth';
import { UserService } from '../services/users/user.service';

const router = Router();

// Create services
const jwtService = new JwtService();
const authService = new AuthService(jwtService);
const userService = new UserService(); // Add this
const authController = new AuthController(authService, userService); // Pass it

router.post('/register', (req, res) => authController.register(req, res));
router.post('/login', (req, res) => authController.login(req, res));
//router.post('/verify-phone', (req, res) => authController.verifyPhone(req, res));
//router.post('/refresh-token', (req, res) => authController.refreshToken(req, res));
//router.get('/profile', (req, res) => authController.getProfile(req, res));

export default router;
