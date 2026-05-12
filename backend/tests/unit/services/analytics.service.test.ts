import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import ProductRepository from "../../../src/repositories/product.repository";
import AnalyticsService from "../../../src/services/analytics.service";

describe("AnalyticsService", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it("builds dashboard metrics", async () => {
    jest.spyOn(ProductRepository, "countAll").mockResolvedValue(10);
    jest.spyOn(ProductRepository, "countExpired").mockResolvedValue(2);
    jest.spyOn(ProductRepository, "countExpiring").mockResolvedValue(3);
    jest.spyOn(ProductRepository, "countByCategory").mockResolvedValue([
      {
        categoryId: "cat-1",
        categoryName: "Lácteos",
        count: 5,
      },
    ]);

    const result = await AnalyticsService.getDashboard();

    expect(result.totalProducts).toBe(10);
    expect(result.expiredProducts).toBe(2);
    expect(result.expiringProducts).toBe(3);
    expect(result.inventoryStatusDistribution.ok).toBe(5);
  });
});
