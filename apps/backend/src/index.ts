// Load environment variables FIRST
import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { appConfig } from './config/app.config';
import { errorHandler } from './middleware/error.middleware';
import authRoutes from './routes/auth.routes';

const app = express();

// Middleware
app.use(helmet());
app.use(cors(appConfig.cors));
app.use(morgan(appConfig.nodeEnv === 'development' ? 'dev' : 'combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
// User routes
app.use(`${appConfig.apiPrefix}/users`, userRoutes);

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
��� ${new Date().toLocaleString()}
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

// Import user routes
import userRoutes from './routes/user.routes';

// Add to app (after auth routes)
app.use(`${appConfig.apiPrefix}/users`, userRoutes);
