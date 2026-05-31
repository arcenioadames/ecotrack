import { useCallback, useEffect, useRef, useState } from 'react';

import { apiClient } from '../services/axios';

export type ProductsByCategoryItem = {
  categoryId: string;
  categoryName: string;
  count: number;
};

export type InventoryStatusDistribution = {
  ok: number;
  expiring: number;
  expired: number;
};

export interface AnalyticsDashboardData {
  totalProducts: number;
  expiringProducts: number;
  expiredProducts: number;
  productsByCategory: ProductsByCategoryItem[];
  inventoryStatusDistribution: InventoryStatusDistribution;
}

export interface UseDashboardReturn {
  data: AnalyticsDashboardData | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useDashboard(): UseDashboardReturn {
  const [data, setData] = useState<AnalyticsDashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get('/analytics/dashboard');

      const received = response.data as AnalyticsDashboardData;
      setData(received);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error desconocido';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const runInitial = async () => {
      if (!isMounted) return;
      await refresh();
    };

    runInitial();

    intervalRef.current = setInterval(() => {
      // Ejecutar refresh sin bloquear el render.
      void refresh();
    }, 60_000);

    return () => {
      isMounted = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [refresh]);

  return {
    data,
    loading,
    error,
    refresh,
  };
}

