import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import CategoryRepository from "../../../src/repositories/category.repository";
import CategoryService, { CategoryServiceError } from "../../../src/services/category.service";

describe("CategoryService", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it("creates category when name is available", async () => {
    jest.spyOn(CategoryRepository, "findByNameInsensitive").mockResolvedValue(null);
    jest.spyOn(CategoryRepository, "create").mockResolvedValue({
      id: "cat-1",
      name: "Lácteos",
      description: "Frío",
      _count: { products: 0 },
      createdAt: new Date("2026-05-12T00:00:00.000Z"),
      updatedAt: new Date("2026-05-12T00:00:00.000Z"),
    });

    const result = await CategoryService.create({
      name: "Lácteos",
      description: "Frío",
    });

    expect(result.id).toBe("cat-1");
    expect(result.name).toBe("Lácteos");
    expect(CategoryRepository.create).toHaveBeenCalledWith({
      name: "Lácteos",
      description: "Frío",
    });
  });

  it("rejects duplicate category name", async () => {
    jest.spyOn(CategoryRepository, "findByNameInsensitive").mockResolvedValue({
      id: "cat-1",
      name: "Lácteos",
      description: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await expect(
      CategoryService.create({
        name: "Lácteos",
      }),
    ).rejects.toStrictEqual(new CategoryServiceError("CATEGORY_ALREADY_EXISTS"));
  });

  it("prevents delete when category has products", async () => {
    jest.spyOn(CategoryRepository, "findById").mockResolvedValue({
      id: "cat-1",
      name: "Lácteos",
      description: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    jest.spyOn(CategoryRepository, "countProductsByCategoryId").mockResolvedValue(2);

    await expect(CategoryService.delete("cat-1")).rejects.toStrictEqual(
      new CategoryServiceError("CATEGORY_HAS_PRODUCTS"),
    );
  });

  it("updates category and validates duplicate name", async () => {
    jest.spyOn(CategoryRepository, "findById").mockResolvedValue({
      id: "cat-1",
      name: "Lácteos",
      description: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    jest.spyOn(CategoryRepository, "findByNameInsensitive").mockResolvedValue(null);
    jest.spyOn(CategoryRepository, "update").mockResolvedValue({
      id: "cat-1",
      name: "Panadería",
      description: "Secos",
      _count: { products: 0 },
      createdAt: new Date("2026-05-12T00:00:00.000Z"),
      updatedAt: new Date("2026-05-12T01:00:00.000Z"),
    });

    const result = await CategoryService.update("cat-1", {
      name: "Panadería",
      description: "Secos",
    });

    expect(result.name).toBe("Panadería");
    expect(CategoryRepository.update).toHaveBeenCalledWith("cat-1", {
      name: "Panadería",
      description: "Secos",
    });
  });
});
