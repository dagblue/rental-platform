import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { rateLimit } from 'express-rate-limit';
import { API_BASE_URL, APP_NAME } from '@rental-platform/shared';
import { connectDatabase, checkDatabaseHealth } from '@rental-platform/database';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per window
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests from this IP, please try again later.'
  }
});

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(compression()); // Response compression
app.use(express.json({ limit: '10mb' })); // Body parser
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan(NODE_ENV === 'development' ? 'dev' : 'combined'));
app.use(limiter); // Apply rate limiting to all routes

// Health check endpoint
app.get('/api/health', async (req, res) => {
  const dbHealth = await checkDatabaseHealth();
  
  res.json({
    success: true,
    data: {
      app: APP_NAME,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: NODE_ENV,
      database: dbHealth ? 'connected' : 'disconnected',
      uptime: process.uptime()
    }
  });
});

// API routes placeholder
app.get('/api', (req, res) => {
  res.json({
    success: true,
    data: {
      app: APP_NAME,
      version: '1.0.0',
      documentation: `${API_BASE_URL}/api-docs`,
      endpoints: {
        auth: `${API_BASE_URL}/api/auth`,
        users: `${API_BASE_URL}/api/users`,
        listings: `${API_BASE_URL}/api/listings`,
        bookings: `${API_BASE_URL}/api/bookings`,
        payments: `${API_BASE_URL}/api/payments`
      }
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  
  res.status(err.status || 500).json({
    success: false,
    error: NODE_ENV === 'development' ? err.message : 'Something went wrong',
    ...(NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
async function startServer() {
  try {
    // Connect to database
    await connectDatabase();
    console.log('✅ Database connected');
    
    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running in ${NODE_ENV} mode`);
      console.log(`📡 API: ${API_BASE_URL}`);
      console.log(`🌐 Health: ${API_BASE_URL}/api/health`);
      console.log(`📊 Database: Connected`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});