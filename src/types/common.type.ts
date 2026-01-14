import { Request } from "express";

export interface AuthenticatedRequest extends Request {
  user?: any;
}

export interface PaginatedRequest extends Request {
  paginatedData?: {
    pagination: {
      totalResults: number;
      totalPages: number;
      currentPage: number;
      pageSize: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
    data: any[];
  };
}

// Pagination Interface
export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalResults: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// API Response Interface
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  pagination?: PaginationMeta;
}
