import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import CategoryRepository from "../../../src/repositories/category.repository";
import ProductRepository from "../../../src/repositories/product.repository";
import ProductService, { ProductServiceError } from "../../../src/services/product.service";

describe("ProductService", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it("creates product and links creator", async () => {
    jest.spyOn(CategoryRepository, "findById").mockResolvedValue({
      id: "cat-1",
      name: "Lácteos",
      description: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    jest.spyOn(ProductRepository, "findByBarcode").mockResolvedValue(null);
    jest.spyOn(ProductRepository, "create").mockResolvedValue({
      id: "prod-1",
      name: "Leche",
      barcode: "770123",
      expirationDate: new Date("2026-05-30T00:00:00.000Z"),
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
    });

    const result = await ProductService.create(
      {
        name: "Leche",
        barcode: "770123",
        expirationDate: new Date("2026-05-30T00:00:00.000Z"),
        categoryId: "cat-1",
      },
      "user-1",
    );

    expect(result.createdBy).toBe("user-1");
  });

  it("rejects duplicate barcode", async () => {
    jest.spyOn(CategoryRepository, "findById").mockResolvedValue({
      id: "cat-1",
      name: "Lácteos",
      description: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    jest.spyOn(ProductRepository, "findByBarcode").mockResolvedValue({
      id: "prod-1",
      name: "Leche",
      barcode: "770123",
      expirationDate: new Date(),
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
    } as never);

    await expect(
      ProductService.create(
        {
          name: "Leche",
          barcode: "770123",
          expirationDate: new Date("2026-05-30T00:00:00.000Z"),
          categoryId: "cat-1",
        },
        "user-1",
      ),
    ).rejects.toStrictEqual(new ProductServiceError("PRODUCT_BARCODE_ALREADY_EXISTS"));
  });

  it("returns paginated list", async () => {
    jest.spyOn(ProductRepository, "findManyWithFilters").mockResolvedValue({
      items: [
        {
          id: "prod-1",
          name: "Leche",
          barcode: "770123",
          expirationDate: new Date("2026-05-30T00:00:00.000Z"),
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
      ],
      total: 1,
    });

    const result = await ProductService.list({
      page: 1,
      limit: 10,
    });

    expect(result.items).toHaveLength(1);
    expect(result.pagination.total).toBe(1);
  });

  it("rejects invalid date range in filters", async () => {
    await expect(
      ProductService.list({
        page: 1,
        limit: 10,
        expirationFrom: new Date("2026-06-01T00:00:00.000Z"),
        expirationTo: new Date("2026-05-01T00:00:00.000Z"),
      }),
    ).rejects.toStrictEqual(new ProductServiceError("INVALID_DATE_RANGE"));
  });

  it("gets product by id", async () => {
    jest.spyOn(ProductRepository, "findById").mockResolvedValue({
      id: "prod-1",
      name: "Leche",
      barcode: "770123",
      expirationDate: new Date("2026-05-30T00:00:00.000Z"),
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
    });

    const result = await ProductService.getById("prod-1");
    expect(result.id).toBe("prod-1");
  });

  it("gets product by barcode", async () => {
    jest.spyOn(ProductRepository, "findByBarcode").mockResolvedValue({
      id: "prod-2",
      name: "Yogur",
      barcode: "1234567890123",
      expirationDate: new Date("2026-06-01T00:00:00.000Z"),
      categoryId: "cat-1",
      createdBy: "staff-1",
      createdAt: new Date(),
      updatedAt: new Date(),
      category: {
        id: "cat-1",
        name: "Lácteos",
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    } as never);

    const result = await ProductService.getByBarcode("1234567890123");
    expect(result.barcode).toBe("1234567890123");
  });

  it("fails when barcode does not exist", async () => {
    jest.spyOn(ProductRepository, "findByBarcode").mockResolvedValue(null);

    await expect(ProductService.getByBarcode("0000000000000")).rejects.toStrictEqual(
      new ProductServiceError("PRODUCT_NOT_FOUND"),
    );
  });

  it("fails when product does not exist", async () => {
    jest.spyOn(ProductRepository, "findById").mockResolvedValue(null);

    await expect(ProductService.getById("missing")).rejects.toStrictEqual(
      new ProductServiceError("PRODUCT_NOT_FOUND"),
    );
  });

  it("updates product", async () => {
    jest.spyOn(ProductRepository, "findById").mockResolvedValue({
      id: "prod-1",
      name: "Leche",
      barcode: "770123",
      expirationDate: new Date("2026-05-30T00:00:00.000Z"),
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
    });
    jest.spyOn(CategoryRepository, "findById").mockResolvedValue({
      id: "cat-2",
      name: "Panadería",
      description: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    jest.spyOn(ProductRepository, "findByBarcode").mockResolvedValue(null);
    jest.spyOn(ProductRepository, "update").mockResolvedValue({
      id: "prod-1",
      name: "Pan",
      barcode: "770999",
      expirationDate: new Date("2026-06-10T00:00:00.000Z"),
      categoryId: "cat-2",
      createdBy: "user-1",
      createdAt: new Date(),
      updatedAt: new Date(),
      category: {
        id: "cat-2",
        name: "Panadería",
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    const result = await ProductService.update("prod-1", {
      name: "Pan",
      barcode: "770999",
      expirationDate: new Date("2026-06-10T00:00:00.000Z"),
      categoryId: "cat-2",
    });

    expect(result.name).toBe("Pan");
  });

  it("fails update when category does not exist", async () => {
    jest.spyOn(ProductRepository, "findById").mockResolvedValue({
      id: "prod-1",
      name: "Leche",
      barcode: "770123",
      expirationDate: new Date("2026-05-30T00:00:00.000Z"),
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
    });
    jest.spyOn(CategoryRepository, "findById").mockResolvedValue(null);

    await expect(ProductService.update("prod-1", { categoryId: "cat-x" })).rejects.toStrictEqual(
      new ProductServiceError("CATEGORY_NOT_FOUND"),
    );
  });

  it("deletes product", async () => {
    jest.spyOn(ProductRepository, "findById").mockResolvedValue({
      id: "prod-1",
      name: "Leche",
      barcode: "770123",
      expirationDate: new Date("2026-05-30T00:00:00.000Z"),
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
    });
    const deleteSpy = jest.spyOn(ProductRepository, "delete").mockResolvedValue({
      id: "prod-1",
      name: "Leche",
      barcode: "770123",
      expirationDate: new Date("2026-05-30T00:00:00.000Z"),
      categoryId: "cat-1",
      createdBy: "user-1",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await ProductService.delete("prod-1");
    expect(deleteSpy).toHaveBeenCalledWith("prod-1");
  });

  it("lists expiring products", async () => {
    jest.spyOn(ProductRepository, "findExpiring").mockResolvedValue([
      {
        id: "prod-1",
        name: "Leche",
        barcode: "770123",
        expirationDate: new Date("2026-05-13T00:00:00.000Z"),
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

    const result = await ProductService.listExpiring(3);
    expect(result[0].status).toBeDefined();
  });
});
