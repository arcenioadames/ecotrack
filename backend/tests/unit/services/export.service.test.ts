import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import ProductRepository from "../../../src/repositories/product.repository";
import ExportService from "../../../src/services/export/export.service";

describe("ExportService", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it("returns exportable products", async () => {
    jest.spyOn(ProductRepository, "findExportable").mockResolvedValue([
      {
        id: "prod-1",
        name: "Leche",
        barcode: "770123",
        expirationDate: new Date("2026-05-01T00:00:00.000Z"),
        categoryId: "cat-1",
        createdBy: "user-1",
        createdAt: new Date(),
        updatedAt: new Date(),
        category: {
          id: "cat-1",
          name: "Lácteos",
          description: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      },
    ]);

    const service = new ExportService();
    const items = await service.getExportableProducts({});

    expect(items).toHaveLength(1);
    expect(items[0].categoryName).toBe("Lácteos");
  });

  it("exports in excel format", async () => {
    jest.spyOn(ProductRepository, "findExportable").mockResolvedValue([]);

    const service = new ExportService();
    const result = await service.export("excel", {});

    expect(result.fileName.endsWith(".xlsx")).toBe(true);
    expect(result.mimeType).toContain("spreadsheetml");
  });

  it("exports in pdf format", async () => {
    jest.spyOn(ProductRepository, "findExportable").mockResolvedValue([]);

    const service = new ExportService();
    const result = await service.export("pdf", {});

    expect(result.fileName.endsWith(".pdf")).toBe(true);
    expect(result.mimeType).toBe("application/pdf");
  });
});
