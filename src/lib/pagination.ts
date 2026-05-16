export const ITEMS_PER_PAGE = 21;
export const COLLECTIONS_PER_PAGE = 21;
export const DASHBOARD_COLLECTIONS_LIMIT = 6;
export const DASHBOARD_RECENT_ITEMS_LIMIT = 10;

export interface PaginationMeta {
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  totalItems: number;
  totalPages: number;
}

export function getPageNumber(value: string | string[] | undefined) {
  const pageValue = Array.isArray(value) ? value[0] : value;
  const parsedPage = Number.parseInt(pageValue ?? "1", 10);

  if (!Number.isFinite(parsedPage) || parsedPage < 1) {
    return 1;
  }

  return parsedPage;
}

export function getPaginationMeta(totalItems: number, requestedPage: number, perPage: number) {
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
  const currentPage = Math.min(Math.max(requestedPage, 1), totalPages);

  return {
    currentPage,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
    totalItems,
    totalPages,
  } satisfies PaginationMeta;
}

export function getPaginationSkip(currentPage: number, perPage: number) {
  return (currentPage - 1) * perPage;
}
