import { Router } from 'express';
import { AuthController } from '../controllers/auth/auth.controller';
import { AuthService } from '@rental-platform/auth/services';
import { JwtService } from '@rental-platform/auth/services';
import { UserServiceDb } from '../services/users/user.service.db';
import { dbConfig } from '../config/database.config';

const router = Router();

const jwtService = new JwtService();
const authService = new AuthService(jwtService, dbConfig.useDatabase);
const userService = new UserServiceDb();
const authController = new AuthController(authService, userService);

router.post('/register', (req, res) => authController.register(req, res));
router.post('/login', (req, res) => authController.login(req, res));
router.post('/logout', (req, res) => authController.logout(req, res));
router.post('/refresh', (req, res) => authController.refreshToken(req, res));

export default router;
