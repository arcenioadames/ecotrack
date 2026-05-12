import type { InventoryStatus } from "../utils/inventory-status.util";

export type ProductDto = {
  id: string;
  name: string;
  barcode: string;
  expirationDate: Date;
  category: {
    id: string;
    name: string;
    description: string | null;
  };
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  status: InventoryStatus;
};

export type ProductListResponseDto = {
  items: ProductDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type ProductFilters = {
  page: number;
  limit: number;
  search?: string;
  categoryId?: string;
  expirationFrom?: Date;
  expirationTo?: Date;
};
