import { Response } from 'express';

export class ApiResponse<T = any> {
  constructor(
    public success: boolean,
    public data?: T,
    public error?: string,
    public message?: string,
    public meta?: {
      page?: number;
      limit?: number;
      total?: number;
      totalPages?: number;
      hasMore?: boolean;
    }
  ) {}

  static success<T>(data: T, message?: string): ApiResponse<T> {
    return new ApiResponse(true, data, undefined, message);
  }

  static error(error: string, message?: string): ApiResponse {
    return new ApiResponse(false, undefined, error, message);
  }

  static paginated<T>(
    data: T[],
    meta: {
      page: number;
      limit: number;
      total: number;
    }
  ): ApiResponse<T[]> {
    const totalPages = Math.ceil(meta.total / meta.limit);
    const hasMore = meta.page < totalPages;

    return new ApiResponse(true, data, undefined, undefined, {
      page: meta.page,
      limit: meta.limit,
      total: meta.total,
      totalPages,
      hasMore,
    });
  }

  send(res: Response, statusCode: number = 200): Response {
    return res.status(statusCode).json({
      success: this.success,
      data: this.data,
      error: this.error,
      message: this.message,
      meta: this.meta,
    });
  }
}