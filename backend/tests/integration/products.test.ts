import request from "supertest";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { generateAccessToken } from "../../src/utils/jwt";

jest.mock("../../prisma/client", () => ({
  prisma: {
    category: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    product: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      groupBy: jest.fn(),
    },
  },
}));

import { app } from "../../src/app";
import { prisma } from "../../prisma/client";

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe("/products", () => {
  const adminToken = generateAccessToken({ sub: "admin-1", role: "ADMIN" });
  const staffToken = generateAccessToken({ sub: "staff-1", role: "STAFF" });

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma.category.findUnique.mockResolvedValue({
      id: "cat-1",
      name: "Lácteos",
      description: null,
      _count: { products: 0 },
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never);
    mockPrisma.product.findFirst.mockResolvedValue(null as never);
    mockPrisma.product.count.mockResolvedValue(0 as never);
    mockPrisma.product.findMany.mockResolvedValue([] as never);
  });

  it("creates product with STAFF token", async () => {
    mockPrisma.product.create.mockResolvedValue({
      id: "prod-1",
      name: "Leche",
      barcode: "770123",
      expirationDate: new Date("2026-06-01T00:00:00.000Z"),
      categoryId: "cat-1",
      createdBy: "staff-1",
      createdAt: new Date(),
      updatedAt: new Date(),
      category: {
        id: "cat-1",
        name: "Lácteos",
        description: null,
      },
    } as never);

    const response = await request(app)
      .post("/products")
      .set("Authorization", `Bearer ${staffToken}`)
      .send({
        name: "Leche",
        barcode: "770123",
        expirationDate: "2026-06-01T00:00:00.000Z",
        categoryId: "cat-1",
      });

    expect(response.status).toBe(201);
    expect(response.body.product.createdBy).toBe("staff-1");
  });

  it("lists products with pagination", async () => {
    mockPrisma.product.findMany.mockResolvedValue([
      {
        id: "prod-1",
        name: "Leche",
        barcode: "770123",
        expirationDate: new Date("2026-06-01T00:00:00.000Z"),
        categoryId: "cat-1",
        createdBy: "staff-1",
        createdAt: new Date(),
        updatedAt: new Date(),
        category: {
          id: "cat-1",
          name: "Lácteos",
          description: null,
        },
      },
    ] as never);
    mockPrisma.product.count.mockResolvedValue(1 as never);

    const response = await request(app)
      .get("/products?page=1&limit=10")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.items).toHaveLength(1);
    expect(response.body.pagination.total).toBe(1);
  });

  it("gets product by id", async () => {
    mockPrisma.product.findUnique.mockResolvedValue({
      id: "prod-1",
      name: "Leche",
      barcode: "770123",
      expirationDate: new Date("2026-06-01T00:00:00.000Z"),
      categoryId: "cat-1",
      createdBy: "staff-1",
      createdAt: new Date(),
      updatedAt: new Date(),
      category: {
        id: "cat-1",
        name: "Lácteos",
        description: null,
      },
    } as never);

    const response = await request(app)
      .get("/products/prod-1")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.product.id).toBe("prod-1");
  });

  it("gets product by barcode", async () => {
    mockPrisma.product.findFirst.mockResolvedValue({
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
      },
    } as never);

    const response = await request(app)
      .get("/products/barcode/1234567890123")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.product.barcode).toBe("1234567890123");
  });

  it("returns 404 when barcode does not exist", async () => {
    mockPrisma.product.findFirst.mockResolvedValue(null as never);

    const response = await request(app)
      .get("/products/barcode/0000000000000")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).toBe(404);
  });

  it("blocks STAFF update due role", async () => {
    const response = await request(app)
      .patch("/products/prod-1")
      .set("Authorization", `Bearer ${staffToken}`)
      .send({ name: "Nuevo nombre" });

    expect(response.status).toBe(403);
  });

  it("returns expiring products", async () => {
    mockPrisma.product.findMany.mockResolvedValue([
      {
        id: "prod-1",
        name: "Leche",
        barcode: "770123",
        expirationDate: new Date("2026-05-13T00:00:00.000Z"),
        categoryId: "cat-1",
        createdBy: "staff-1",
        createdAt: new Date(),
        updatedAt: new Date(),
        category: {
          id: "cat-1",
          name: "Lácteos",
          description: null,
        },
      },
    ] as never);

    const response = await request(app)
      .get("/products/expiring?days=3")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.items).toHaveLength(1);
  });

  it("updates product for ADMIN", async () => {
    mockPrisma.product.findUnique.mockResolvedValue({
      id: "prod-1",
      name: "Leche",
      barcode: "770123",
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
    mockPrisma.category.findUnique.mockResolvedValue({
      id: "cat-1",
      name: "Lácteos",
      description: null,
      _count: { products: 0 },
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never);
    mockPrisma.product.findFirst.mockResolvedValue(null as never);
    mockPrisma.product.update.mockResolvedValue({
      id: "prod-1",
      name: "Leche Premium",
      barcode: "770123",
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

    const response = await request(app)
      .patch("/products/prod-1")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Leche Premium" });

    expect(response.status).toBe(200);
    expect(response.body.product.name).toBe("Leche Premium");
  });

  it("deletes product for ADMIN", async () => {
    mockPrisma.product.findUnique.mockResolvedValue({
      id: "prod-1",
      name: "Leche",
      barcode: "770123",
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
    mockPrisma.product.delete.mockResolvedValue({
      id: "prod-1",
      name: "Leche",
      barcode: "770123",
      expirationDate: new Date("2026-06-01T00:00:00.000Z"),
      categoryId: "cat-1",
      createdBy: "staff-1",
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never);

    const response = await request(app)
      .delete("/products/prod-1")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).toBe(204);
  });

  it("returns 400 on invalid date range in list query", async () => {
    const response = await request(app)
      .get("/products?expirationFrom=2026-06-01T00:00:00.000Z&expirationTo=2026-05-01T00:00:00.000Z")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("INVALID_DATE_RANGE");
  });

  it("exports expired products as PDF", async () => {
    mockPrisma.product.findMany.mockResolvedValue([
      {
        id: "prod-expired-1",
        name: "Yogur",
        barcode: "770999",
        expirationDate: new Date("2026-05-01T00:00:00.000Z"),
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
      },
    ] as never);

    const response = await request(app)
      .get("/products/export?format=pdf")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.headers["content-disposition"]).toContain(".pdf");
    expect(response.headers["content-type"]).toContain("application/pdf");
  });

  it("exports all filtered products as Excel", async () => {
    mockPrisma.product.findMany.mockResolvedValue([
      {
        id: "prod-1",
        name: "Leche",
        barcode: "770123",
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
      },
    ] as never);

    const response = await request(app)
      .get("/products/export?format=excel&status=all")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.headers["content-disposition"]).toContain(".xlsx");
    expect(response.headers["content-type"]).toContain("spreadsheetml");
  });
});
