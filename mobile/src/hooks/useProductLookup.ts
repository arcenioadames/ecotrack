import { useCallback, useState } from 'react';
import type { AxiosError } from 'axios';
import { apiClient } from '../services/axios';

interface ProductLookupResult {
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
}

export interface UseProductLookupReturn {
  product: ProductLookupResult | null;
  isLoading: boolean;
  error: string | null;
  notFound: boolean;
  lookupProduct: (barcode: string) => Promise<void>;
  clearLookupError: () => void;
}

/**
 * Hook para buscar un producto por código de barras desde backend.
 * Sirve para autocompletar datos en el scanner y ofrecer fallback manual.
 */
export function useProductLookup(): UseProductLookupReturn {
  const [product, setProduct] = useState<ProductLookupResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const clearLookupError = useCallback((): void => {
    setError(null);
  }, []);

  const lookupProduct = useCallback(async (barcode: string): Promise<void> => {
    const normalizedCode = barcode.trim();
    if (!normalizedCode) {
      setError('Ingresa un código de barras para buscar.');
      setNotFound(false);
      setProduct(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    setNotFound(false);

    try {
      const response = await apiClient.get<{ product: ProductLookupResult }>(
        `/products/barcode/${encodeURIComponent(normalizedCode)}`,
      );

      setProduct(response.data.product);
      setNotFound(false);
    } catch (err: unknown) {
      if (err instanceof Error) {
        const axiosError = err as AxiosError;
        if (axiosError.response?.status === 404) {
          setProduct(null);
          setNotFound(true);
          return;
        }
      }

      setError('No se pudo buscar el producto. Intenta de nuevo.');
      setProduct(null);
      setNotFound(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    product,
    isLoading,
    error,
    notFound,
    lookupProduct,
    clearLookupError,
  };
}
