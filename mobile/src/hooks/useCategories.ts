import { useCallback, useEffect, useMemo, useState } from 'react';
import type { AxiosError } from 'axios';

import { apiClient } from '../services/axios';

export interface CategoryLookup {
  id: string;
  name: string;
  description: string | null;
}

export interface UseCategoriesReturn {
  categories: CategoryLookup[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useCategories(): UseCategoriesReturn {
  const [categories, setCategories] = useState<CategoryLookup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiClient.get<CategoryLookup[]>('/categories');
      setCategories(response.data);
    } catch (err: unknown) {
      const axiosError = err as AxiosError;
      setError(axiosError?.message || 'No se pudieron cargar las categorías');
      setCategories([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return useMemo(
    () => ({
      categories,
      isLoading,
      error,
      refetch,
    }),
    [categories, error, isLoading, refetch],
  );
}

