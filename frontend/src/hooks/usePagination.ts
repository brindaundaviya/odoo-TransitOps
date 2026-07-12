import { useMemo, useState } from 'react';

interface UsePaginationOptions {
  initialPage?: number;
  initialLimit?: number;
}

export const usePagination = ({ initialPage = 1, initialLimit = 20 }: UsePaginationOptions = {}) => {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);

  const offset = useMemo(() => (page - 1) * limit, [page, limit]);

  return {
    page,
    limit,
    offset,
    setPage,
    setLimit,
  };
};
