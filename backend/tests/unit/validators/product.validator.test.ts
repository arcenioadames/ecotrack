import { describe, expect, it } from "@jest/globals";

import {
  createProductSchema,
  expiringProductsQuerySchema,
  listProductsQuerySchema,
  updateProductSchema,
} from "../../../src/validators/product.validator";

describe("Product validator", () => {
  it("validates create product payload", () => {
    const parsed = createProductSchema.safeParse({
      name: "Leche Entera",
      barcode: "7701234567890",
      expirationDate: "2026-05-30T00:00:00.000Z",
      categoryId: "cat-1",
    });

    expect(parsed.success).toBe(true);
  });

  it("rejects short product name", () => {
    const parsed = createProductSchema.safeParse({
      name: "AB",
      barcode: "7701234567890",
      expirationDate: "2026-05-30T00:00:00.000Z",
      categoryId: "cat-1",
    });

    expect(parsed.success).toBe(false);
  });

  it("validates list query with pagination and filters", () => {
    const parsed = listProductsQuerySchema.safeParse({
      page: "2",
      limit: "25",
      search: "leche",
      categoryId: "cat-1",
      expirationFrom: "2026-05-01T00:00:00.000Z",
      expirationTo: "2026-06-01T00:00:00.000Z",
    });

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.page).toBe(2);
      expect(parsed.data.limit).toBe(25);
    }
  });

  it("rejects empty update payload", () => {
    const parsed = updateProductSchema.safeParse({});
    expect(parsed.success).toBe(false);
  });

  it("validates expiring query", () => {
    const parsed = expiringProductsQuerySchema.safeParse({ days: "3" });
    expect(parsed.success).toBe(true);
  });
});
