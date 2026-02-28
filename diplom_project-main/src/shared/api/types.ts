/**
 * API типы и интерфейсы (общие)
 */

export interface ListResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface InfiniteScrollResponse<T> {
  data: T[];
  totalCount: number;
}

export interface ApiError {
  message: string;
  code?: string;
  statusCode: number;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sort?: string;
  search?: string;
}

export interface InfiniteScrollParams {
  offset: number;
  limit: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
}
