import apiClient from './axios';
import type { ApiResponse } from '../types';

export interface ProductCreatePayload {
  name: string;
  barcode: string;
  expirationDate: string | Date;
  categoryId: string;
}

export interface ProductCreateResponse {
  product: {
    id: string;
    name: string;
    barcode: string;
    expirationDate: string;
    category: { id: string; name: string; description: string | null };
    createdBy: string;
  };
}

export const productApi = {
  create: async (payload: ProductCreatePayload) => {
    const response = await apiClient.post<ApiResponse<ProductCreateResponse>>("/products", {
      ...payload,
      expirationDate:
        payload.expirationDate instanceof Date
          ? payload.expirationDate.toISOString()
          : payload.expirationDate,
    });
    return response.data;
  },
};

