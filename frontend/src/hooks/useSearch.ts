import { useState, useCallback } from "react";

export function useSearch<T>(
  searchFn: (query: string) => Promise<T[]>,
  initialData: T[] = []
) {
  const [data, setData] = useState<T[]>(initialData);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const performSearch = useCallback(
    async (query: string) => {
      // Only search if query has 2 or more characters
      if (query.length < 2) {
        setData(initialData);
        return;
      }

      try {
        setIsSearching(true);
        const results = await searchFn(query);
        setData(results);
      } catch (err) {
        setError(err as Error);
        setData(initialData);
      } finally {
        setIsSearching(false);
      }
    },
    [searchFn, initialData]
  );

  return { data, isSearching, error, performSearch };
}
