/**
 * Shared pagination helpers for admin route search params and listing loaders.
 */
export const DEFAULT_ADMIN_PAGE = 1;
export const ADMIN_DIRECTORY_PAGE_SIZE = 25;
export const ADMIN_AUDIT_PAGE_SIZE = 20;

export interface AdminPaginatedResult<T> {
  hasNextPage: boolean;
  items: T[];
  page: number;
  pageSize: number;
  totalCount?: number | null;
}

/**
 * Normalizes a URL search-param page value into a positive page number.
 */
export function normalizePaginationPage(value: unknown): number {
  const parsedPage =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number.parseInt(value, 10)
        : Number.NaN;

  if (!Number.isInteger(parsedPage) || parsedPage < DEFAULT_ADMIN_PAGE) {
    return DEFAULT_ADMIN_PAGE;
  }

  return parsedPage;
}

/**
 * Calculates the zero-based item offset for a paginated query.
 */
export function getPaginationOffset(page: number, pageSize: number): number {
  return (normalizePaginationPage(page) - DEFAULT_ADMIN_PAGE) * pageSize;
}

/**
 * Returns the inclusive start and exclusive end indexes for a page slice.
 */
export function getPaginationSliceBounds(page: number, pageSize: number) {
  const normalizedPageSize =
    Number.isInteger(pageSize) && pageSize > 0
      ? pageSize
      : ADMIN_DIRECTORY_PAGE_SIZE;
  const startIndex = getPaginationOffset(page, normalizedPageSize);

  return {
    endIndex: startIndex + normalizedPageSize,
    startIndex,
  };
}

/**
 * Slices a list into the requested page and exposes whether another page exists.
 */
export function paginateItems<T>(
  items: T[],
  page: number,
  pageSize: number,
): AdminPaginatedResult<T> {
  const normalizedPage = normalizePaginationPage(page);
  const { endIndex, startIndex } = getPaginationSliceBounds(
    normalizedPage,
    pageSize,
  );

  return {
    hasNextPage: items.length > endIndex,
    items: items.slice(startIndex, endIndex),
    page: normalizedPage,
    pageSize,
  };
}

/**
 * Builds a human-readable item range for the current page.
 */
export function getPaginationSummary(input: {
  itemCount: number;
  page: number;
  pageSize: number;
}) {
  if (input.itemCount <= 0) {
    return null;
  }

  const { startIndex } = getPaginationSliceBounds(input.page, input.pageSize);

  return {
    endItem: startIndex + input.itemCount,
    startItem: startIndex + 1,
  };
}
