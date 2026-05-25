import type { InventoryStatus } from "../../utils/inventory-status.util";

export type ExportableProductDto = {
  id: string;
  name: string;
  barcode: string;
  categoryName: string;
  // JSON-safe representation
  expirationDate: string;
  status: InventoryStatus;
};

export type ExportProductsFilters = {
  search?: string;
  categoryId?: string;
  expirationFrom?: Date;
  expirationTo?: Date;
  status?: "expired" | "all";
};
