import { Router } from 'express';
import { UserController } from '../controllers/users/user.controller';
import { UserServiceDb } from '../services/users/user.service.db';
import { UploadController } from '../controllers/upload/upload.controller';
import { UploadService } from '../services/upload/upload.service';
import { authenticate } from '../middleware/auth.middleware';
import { upload } from '../config/upload/multer.config';

const router = Router();

const userService = new UserServiceDb();
const uploadService = new UploadService();
const userController = new UserController(userService);
const uploadController = new UploadController(uploadService);

router.use(authenticate());

router.get('/profile', (req, res) => userController.getProfile(req, res));
router.put('/profile', (req, res) => userController.updateProfile(req, res));

router.post('/upload/id/:type', upload.single('document'), (req, res) =>
  uploadController.uploadIdDocument(req, res)
);
router.post('/upload/profile-picture', upload.single('picture'), (req, res) =>
  uploadController.uploadProfilePicture(req, res)
);

router.get('/trust', (req, res) => userController.getTrustData(req, res));
router.post('/verify-id', (req, res) => userController.verifyId(req, res));
router.get('/verification-status', (req, res) => userController.getVerificationStatus(req, res));
router.post('/guarantors', (req, res) => userController.addGuarantor(req, res));
router.get('/guarantors', (req, res) => userController.getGuarantors(req, res));

export default router;
