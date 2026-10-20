// Load environment variables FIRST
import 'dotenv/config';
import path from 'path';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import listingRoutes from './routes/listing.routes';
import bookingRoutes from './routes/booking.routes';
import paymentRoutes from './routes/payment.routes';
import adminRoutes from './routes/admin.routes';
import reviewRoutes from './routes/review.routes';
import messageRoutes from './routes/message.routes';
import notificationRoutes from './routes/notification.routes';
import { appConfig } from './config/app.config';
import { errorHandler } from './middleware/error.middleware';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';

const app = express();

app.use(helmet({ crossOriginResourcePolicy: false, contentSecurityPolicy: false }));
app.use(cors(appConfig.cors));
app.use(compression());
app.use(cookieParser());
app.use(morgan(appConfig.nodeEnv === 'development' ? 'dev' : 'combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Ethiopian Rental Platform API',
    version: '1.0.0',
    environment: appConfig.nodeEnv,
  });
});

app.use(`${appConfig.apiPrefix}/auth`, authRoutes);
app.use(`${appConfig.apiPrefix}/users`, userRoutes);
app.use(`${appConfig.apiPrefix}/listings`, listingRoutes);
app.use(`${appConfig.apiPrefix}/bookings`, bookingRoutes);
app.use(`${appConfig.apiPrefix}/payments`, paymentRoutes);
app.use(`${appConfig.apiPrefix}/notifications`, notificationRoutes);
app.use(`${appConfig.apiPrefix}/reviews`, reviewRoutes);
app.use(`${appConfig.apiPrefix}/admin`, adminRoutes);
app.use(`${appConfig.apiPrefix}/messages`, messageRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

app.use(errorHandler);

const PORT = appConfig.port;
app.listen(PORT, () => {
  console.log(
    `[API] Ethiopian Rental Platform on port ${PORT} (${appConfig.nodeEnv}) ${appConfig.apiPrefix}`
  );
});

process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

export default app;
