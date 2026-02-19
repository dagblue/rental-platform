// Load environment variables FIRST
import 'dotenv/config';
import path from 'path';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import listingRoutes from './routes/listing.routes';
import bookingRoutes from './routes/booking.routes';
// Import config
import { appConfig } from './config/app.config';

// Import middleware
import { errorHandler } from './middleware/error.middleware';

// Import routes - ALL IMPORTS AT THE TOP!
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';

const app = express();

// Middleware
app.use(helmet());
app.use(cors(appConfig.cors));
app.use(morgan(appConfig.nodeEnv === 'development' ? 'dev' : 'combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Ethiopian Rental Platform API',
    version: '1.0.0',
    environment: appConfig.nodeEnv,
  });
});

// API routes
app.use(`${appConfig.apiPrefix}/auth`, authRoutes);
app.use(`${appConfig.apiPrefix}/users`, userRoutes);
app.use(`${appConfig.apiPrefix}/listings`, listingRoutes);
app.use(`${appConfig.apiPrefix}/bookings`, bookingRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

// Error handling
app.use(errorHandler);

// Start server
const PORT = appConfig.port;
app.listen(PORT, () => {
  console.log(`
��� Ethiopian Rental Platform API
��� Port: ${PORT}
⏰ ${new Date().toLocaleString()}
��� Health: http://localhost:${PORT}/health
��� API: http://localhost:${PORT}${appConfig.apiPrefix}
��� Environment: ${appConfig.nodeEnv}
  `);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

export default app;

// DEBUG: Print what apiPrefix actually is
console.log('��� DEBUG: apiPrefix =', appConfig.apiPrefix);
console.log('��� DEBUG: auth routes mounted at:', `${appConfig.apiPrefix}/auth`);
console.log('��� DEBUG: user routes mounted at:', `${appConfig.apiPrefix}/users`);
