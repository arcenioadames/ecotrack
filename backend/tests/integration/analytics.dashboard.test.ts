import request from "supertest";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { generateAccessToken } from "../../src/utils/jwt";

jest.mock("../../prisma/client", () => ({
  prisma: {
    product: {
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    category: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

import { app } from "../../src/app";
import { prisma } from "../../prisma/client";

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe("GET /analytics/dashboard", () => {
  const adminToken = generateAccessToken({ sub: "admin-1", role: "ADMIN" });
  const staffToken = generateAccessToken({ sub: "staff-1", role: "STAFF" });

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma.product.count
      .mockResolvedValueOnce(10 as never)
      .mockResolvedValueOnce(2 as never)
      .mockResolvedValueOnce(3 as never);
    mockPrisma.product.groupBy.mockResolvedValue([
      {
        categoryId: "cat-1",
        _count: { _all: 5 },
      },
    ] as never);
    mockPrisma.category.findMany.mockResolvedValue([
      {
        id: "cat-1",
        name: "Lácteos",
      },
    ] as never);
  });

  it("returns 403 for STAFF", async () => {
    const response = await request(app)
      .get("/analytics/dashboard")
      .set("Authorization", `Bearer ${staffToken}`);

    expect(response.status).toBe(403);
  });

  it("returns dashboard for ADMIN", async () => {
    const response = await request(app)
      .get("/analytics/dashboard")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.totalProducts).toBe(10);
    expect(response.body.expiredProducts).toBe(2);
    expect(response.body.expiringProducts).toBe(3);
    expect(response.body.inventoryStatusDistribution.ok).toBe(5);
  });
});
