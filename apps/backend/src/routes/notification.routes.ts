import { Router } from 'express';
import { NotificationController } from '../controllers/notifications/notification.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const notificationController = new NotificationController();

// All notification routes require authentication
router.use(authenticate());

// Get notifications with pagination
router.get('/', (req, res) => notificationController.getNotifications(req, res));

// Get unread count
router.get('/unread/count', (req, res) => notificationController.getUnreadCount(req, res));

// Mark a notification as read
router.put('/:notificationId/read', (req, res) => notificationController.markAsRead(req, res));

// Mark all notifications as read
router.put('/read-all', (req, res) => notificationController.markAllAsRead(req, res));

// Delete a notification
router.delete('/:notificationId', (req, res) => notificationController.deleteNotification(req, res));

export default router;
