import request from "supertest";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { generateAccessToken } from "../../src/utils/jwt";

jest.mock("../../prisma/client", () => ({
  prisma: {
    category: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    product: {
      count: jest.fn(),
    },
  },
}));

import { app } from "../../src/app";
import { prisma } from "../../prisma/client";

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe("/categories", () => {
  const adminToken = generateAccessToken({ sub: "admin-1", role: "ADMIN" });
  const staffToken = generateAccessToken({ sub: "staff-1", role: "STAFF" });

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma.category.findMany.mockResolvedValue([] as never);
    mockPrisma.category.findFirst.mockResolvedValue(null as never);
    mockPrisma.category.findUnique.mockResolvedValue(null as never);
    mockPrisma.product.count.mockResolvedValue(0 as never);
  });

  it("returns 403 for STAFF on create category", async () => {
    const response = await request(app)
      .post("/categories")
      .set("Authorization", `Bearer ${staffToken}`)
      .send({ name: "Lácteos" });

    expect(response.status).toBe(403);
    expect(response.body.message).toBe("Forbidden");
  });

  it("creates category for ADMIN", async () => {
    mockPrisma.category.create.mockResolvedValue({
      id: "cat-1",
      name: "Lácteos",
      description: "Frío",
      _count: { products: 0 },
      createdAt: new Date("2026-05-12T00:00:00.000Z"),
      updatedAt: new Date("2026-05-12T00:00:00.000Z"),
    } as never);

    const response = await request(app)
      .post("/categories")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Lácteos", description: "Frío" });

    expect(response.status).toBe(201);
    expect(response.body.category.name).toBe("Lácteos");
    expect(response.body.category.productCount).toBe(0);
  });

  it("lists categories for ADMIN", async () => {
    mockPrisma.category.findMany.mockResolvedValue([
      {
        id: "cat-1",
        name: "Lácteos",
        description: null,
        _count: { products: 3 },
        createdAt: new Date("2026-05-12T00:00:00.000Z"),
        updatedAt: new Date("2026-05-12T00:00:00.000Z"),
      },
    ] as never);

    const response = await request(app)
      .get("/categories")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.items).toHaveLength(1);
    expect(response.body.items[0].productCount).toBe(3);
  });

  it("returns 409 on duplicate category", async () => {
    mockPrisma.category.findFirst.mockResolvedValue({
      id: "cat-1",
      name: "Lácteos",
      description: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never);

    const response = await request(app)
      .post("/categories")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Lácteos" });

    expect(response.status).toBe(409);
    expect(response.body.message).toBe("La categoría ya existe");
  });

  it("returns 404 on update for missing category", async () => {
    const response = await request(app)
      .patch("/categories/cat-missing")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ name: "Panadería" });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Categoría no encontrada");
  });

  it("deletes category when no products are associated", async () => {
    mockPrisma.category.findUnique.mockResolvedValue({
      id: "cat-1",
      name: "Lácteos",
      description: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never);
    mockPrisma.category.delete.mockResolvedValue({
      id: "cat-1",
      name: "Lácteos",
      description: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never);

    const response = await request(app)
      .delete("/categories/cat-1")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).toBe(204);
  });
});
