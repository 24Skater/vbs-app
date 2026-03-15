/**
 * Pagination utilities
 */
import "server-only";

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export const DEFAULT_PAGE_SIZE = 50;
export const MAX_PAGE_SIZE = 200;

/**
 * Parse and validate pagination parameters
 */
export function parsePagination(searchParams: {
  page?: string;
  pageSize?: string;
}): PaginationParams {
  const page = searchParams.page ? Number(searchParams.page) : 1;
  const pageSize = searchParams.pageSize ? Number(searchParams.pageSize) : DEFAULT_PAGE_SIZE;

  // Validate and clamp values
  const validPage = Math.max(1, Math.floor(page) || 1);
  const validPageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, Math.floor(pageSize) || DEFAULT_PAGE_SIZE)
  );

  return {
    page: validPage,
    pageSize: validPageSize,
  };
}

/**
 * Calculate pagination metadata
 */
export function calculatePagination(
  total: number,
  page: number,
  pageSize: number
): PaginationResult<never>["pagination"] {
  const totalPages = Math.ceil(total / pageSize);

  return {
    page,
    pageSize,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  };
}

/**
 * Get skip value for Prisma queries
 */
export function getSkip(page: number, pageSize: number): number {
  return (page - 1) * pageSize;
}
