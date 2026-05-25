import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { apiClient } from "../services/axios";

export interface ExpiringProduct {
  id: string;
  name: string;
  barcode: string;
  expirationDate: string;
  category: {
    id: string;
    name: string;
    description: string | null;
  };
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  status: "OK" | "EXPIRING" | "EXPIRED";
}

interface UseExpiringProductsReturn {
  products: ExpiringProduct[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  fetch: (days?: number) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useExpiringProducts(): UseExpiringProductsReturn {
  const [products, setProducts] = useState<ExpiringProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch = async (days = 3) => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get(`/products/expiring?days=${days}`);
      setProducts(response.data.items || []);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error desconocido";
      setError(message);
      Alert.alert("Error", "No se pudieron cargar los productos próximos a vencer");
      console.error("Expiring products error:", err);
    } finally {
      setLoading(false);
    }
  };

  const refresh = async (days = 3) => {
    try {
      setRefreshing(true);
      setError(null);
      await fetch(days);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  return {
    products,
    loading,
    refreshing,
    error,
    fetch,
    refresh,
  };
}
