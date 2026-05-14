import ProductRepository from "../../repositories/product.repository";
import { getInventoryStatus } from "../../utils/inventory-status.util";

import ExcelExportStrategy from "./strategies/excel.strategy";
import type { ExportFormat, ExportStrategy } from "./strategies/export.strategy";
import PdfExportStrategy from "./strategies/pdf.strategy";
import type { ExportProductsFilters, ExportableProductDto } from "./types";

export class ExportService {
  private readonly strategies: Map<ExportFormat, ExportStrategy>;

  constructor(strategies?: ExportStrategy[]) {
    const defaultStrategies = strategies ?? [new PdfExportStrategy(), new ExcelExportStrategy()];
    this.strategies = new Map(defaultStrategies.map((strategy) => [strategy.format, strategy]));
  }

  public async getExportableProducts(filters: ExportProductsFilters): Promise<ExportableProductDto[]> {
    const products = await ProductRepository.findExportable(filters);
    const now = new Date();

    return products
      .filter((product: { expirationDate: Date }) => filters.status === "all" || product.expirationDate < now)
      .map((product: { id: string; name: string; barcode: string; category: { name: string }; expirationDate: Date }) => ({ 
        id: product.id,
        name: product.name,
        barcode: product.barcode,
        categoryName: product.category.name,
        expirationDate: product.expirationDate,
        status: getInventoryStatus(product.expirationDate, 3),
      }));
  }

  public async export(format: ExportFormat, filters: ExportProductsFilters): Promise<{
    fileName: string;
    mimeType: string;
    payload: Buffer;
  }> {
    const strategy = this.strategies.get(format);
    if (!strategy) {
      throw new Error("EXPORT_FORMAT_NOT_SUPPORTED");
    }

    const items = await this.getExportableProducts(filters);
    const payload = await strategy.generate(items);
    const dateTag = new Date().toISOString().slice(0, 10).replace(/-/g, "_");

    return {
      fileName: `reporte_inventario_${dateTag}.${strategy.getFileExtension()}`,
      mimeType: strategy.getMimeType(),
      payload,
    };
  }
}

export default ExportService;
