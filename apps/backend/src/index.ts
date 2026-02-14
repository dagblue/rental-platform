// Load environment variables FIRST
import 'dotenv/config';
import path from 'path';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

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

// API routes - REGISTERED HERE (ONLY ONCE!)
app.use(`${appConfig.apiPrefix}/auth`, authRoutes);
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
íº€ Ethiopian Rental Platform API
í³¡ Port: ${PORT}
â° ${new Date().toLocaleString()}
í¿¥ Health: http://localhost:${PORT}/health
í´— API: http://localhost:${PORT}${appConfig.apiPrefix}
í¼ Environment: ${appConfig.nodeEnv}
  `);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

export default app;
