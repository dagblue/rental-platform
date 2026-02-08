import { Request, Response, NextFunction } from 'express';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const message = err.message || 'Internal Server Error';
  const isOperational = err instanceof AppError ? err.isOperational : false;

  // Log error
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', {
      message: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
      body: req.body,
      params: req.params,
      query: req.query,
    });
  }

  // Don't leak error details in production
  const response = {
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      isOperational,
    }),
  };

  res.status(statusCode).json(response);
};