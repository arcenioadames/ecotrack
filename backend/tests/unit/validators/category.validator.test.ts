import { describe, expect, it } from "@jest/globals";

import {
  categoryIdParamSchema,
  createCategorySchema,
  updateCategorySchema,
} from "../../../src/validators/category.validator";

describe("Category validator", () => {
  describe("createCategorySchema", () => {
    it("accepts valid category input", () => {
      const parsed = createCategorySchema.safeParse({
        name: "Lácteos",
        description: "Productos refrigerados",
      });

      expect(parsed.success).toBe(true);
    });

    it("rejects category name shorter than 3 chars", () => {
      const parsed = createCategorySchema.safeParse({
        name: "AB",
      });

      expect(parsed.success).toBe(false);
    });
  });

  describe("updateCategorySchema", () => {
    it("accepts partial update", () => {
      const parsed = updateCategorySchema.safeParse({
        description: "Nueva descripción",
      });

      expect(parsed.success).toBe(true);
    });

    it("rejects empty object", () => {
      const parsed = updateCategorySchema.safeParse({});
      expect(parsed.success).toBe(false);
    });
  });

  describe("categoryIdParamSchema", () => {
    it("accepts valid category id", () => {
      const parsed = categoryIdParamSchema.safeParse({ id: "cat-123" });
      expect(parsed.success).toBe(true);
    });

    it("rejects empty id", () => {
      const parsed = categoryIdParamSchema.safeParse({ id: "" });
      expect(parsed.success).toBe(false);
    });
  });
});
