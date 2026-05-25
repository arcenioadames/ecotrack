import request from "supertest";
import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { generateAccessToken } from "../../src/utils/jwt";

jest.mock("../../prisma/client", () => ({
  prisma: {
    product: {
      findMany: jest.fn(),
    },
  },
}));

import { app } from "../../src/app";
import { prisma } from "../../prisma/client";

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe("GET /products/expiring", () => {
  const adminToken = generateAccessToken({ sub: "admin-1", role: "ADMIN" });
  const staffToken = generateAccessToken({ sub: "staff-1", role: "STAFF" });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 401 for unauthenticated requests", async () => {
    const response = await request(app).get("/products/expiring?days=3");

    expect(response.status).toBe(401);
  });

  it("returns expiring products for ADMIN", async () => {
    const mockProducts = [
      {
        id: "prod-1",
        name: "Expired Product",
        barcode: "123456",
        expirationDate: new Date(Date.now() - 86400000),
        categoryId: "cat-1",
        createdBy: "admin-1",
        createdAt: new Date(),
        updatedAt: new Date(),
        category: {
          id: "cat-1",
          name: "Lácteos",
          description: null,
        },
      },
      {
        id: "prod-2",
        name: "Expiring Soon",
        barcode: "234567",
        expirationDate: new Date(Date.now() + 86400000),
        categoryId: "cat-1",
        createdBy: "admin-1",
        createdAt: new Date(),
        updatedAt: new Date(),
        category: {
          id: "cat-1",
          name: "Lácteos",
          description: null,
        },
      },
    ];

    mockPrisma.product.findMany.mockResolvedValue(mockProducts as never);

    const response = await request(app)
      .get("/products/expiring?days=3")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.items)).toBe(true);
    expect(response.body.meta).toBeDefined();
    expect(response.body.meta.days).toBe(3);
  });

  it("returns expiring products for STAFF", async () => {
    mockPrisma.product.findMany.mockResolvedValue([] as never);

    const response = await request(app)
      .get("/products/expiring?days=3")
      .set("Authorization", `Bearer ${staffToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body.items)).toBe(true);
  });

  it("validates days query parameter (non-numeric)", async () => {
    const response = await request(app)
      .get("/products/expiring?days=invalid")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).toBe(400);
  });

  it("enforces minimum days threshold (1)", async () => {
    const response = await request(app)
      .get("/products/expiring?days=0")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).toBe(400);
  });

  it("enforces maximum days threshold (30)", async () => {
    const response = await request(app)
      .get("/products/expiring?days=31")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).toBe(400);
  });

  it("returns empty list when no products are expiring", async () => {
    mockPrisma.product.findMany.mockResolvedValue([] as never);

    const response = await request(app)
      .get("/products/expiring?days=3")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.items).toHaveLength(0);
  });

  it("includes product status field", async () => {
    const mockProducts = [
      {
        id: "prod-1",
        name: "Test Product",
        barcode: "123456",
        expirationDate: new Date(Date.now() + 86400000),
        categoryId: "cat-1",
        createdBy: "admin-1",
        createdAt: new Date(),
        updatedAt: new Date(),
        category: {
          id: "cat-1",
          name: "Test Category",
          description: null,
        },
      },
    ];

    mockPrisma.product.findMany.mockResolvedValue(mockProducts as never);

    const response = await request(app)
      .get("/products/expiring?days=3")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.items.length).toBeGreaterThan(0);
    const product = response.body.items[0];
    expect(["OK", "EXPIRING", "EXPIRED"]).toContain(product.status);
  });

  it("uses default days value of 3 when not specified", async () => {
    mockPrisma.product.findMany.mockResolvedValue([] as never);

    const response = await request(app)
      .get("/products/expiring")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.meta.days).toBe(3);
  });
});
