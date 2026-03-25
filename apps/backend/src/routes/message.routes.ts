import { Router } from 'express';
import { MessageController } from '../controllers/messages/message.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const messageController = new MessageController();

// All message routes require authentication
router.use(authenticate());

// Get all conversations for current user
router.get('/conversations', (req, res) => messageController.getConversations(req, res));

// Get messages for a specific conversation
router.get('/conversations/:conversationId', (req, res) => messageController.getMessages(req, res));

// Send a new message
router.post('/', (req, res) => messageController.sendMessage(req, res));

// Mark messages as read
router.put('/conversations/:conversationId/read', (req, res) => messageController.markAsRead(req, res));

// Get unread count
router.get('/unread/count', (req, res) => messageController.getUnreadCount(req, res));

// Delete a conversation
router.delete('/conversations/:conversationId', (req, res) => messageController.deleteConversation(req, res));

export default router;
