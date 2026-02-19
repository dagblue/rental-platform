import { Router } from 'express';
import { PaymentController } from '../controllers/payments/payment.controller';
import { PaymentService } from '../services/payments/payment.service';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
const paymentService = new PaymentService();
const paymentController = new PaymentController(paymentService);

// All payment routes require authentication
router.use(authenticate());

// Wallet management
router.get('/wallet', (req, res) => paymentController.getWallet(req, res));
router.get('/transactions', (req, res) => paymentController.getTransactions(req, res));
router.post('/withdraw', (req, res) => paymentController.withdraw(req, res));

// Payment processing
router.post('/process', (req, res) => paymentController.processPayment(req, res));
router.post('/release-escrow', (req, res) => paymentController.releaseEscrow(req, res));

// Booking-specific payment info
router.get('/booking/:bookingId', (req, res) => paymentController.getBookingPayments(req, res));
router.get('/escrow/:bookingId', (req, res) => paymentController.getEscrowStatus(req, res));
router.post('/refund/:bookingId', (req, res) => paymentController.refundPayment(req, res));

export default router;
