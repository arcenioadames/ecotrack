import request from "supertest";
import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { generateAccessToken } from "../../src/utils/jwt";

jest.mock("../../prisma/client", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock("bcrypt");

import { app } from "../../src/app";
import { prisma } from "../../prisma/client";
import bcrypt from "bcrypt";

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe("POST /auth/register", () => {
  const adminToken = generateAccessToken({ sub: "admin-1", role: "ADMIN" });
  const staffToken = generateAccessToken({ sub: "staff-1", role: "STAFF" });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 403 for STAFF users", async () => {
    const response = await request(app)
      .post("/auth/register")
      .set("Authorization", `Bearer ${staffToken}`)
      .send({
        name: "Staff Created",
        email: "staff-created@example.com",
        password: "SecurePass123",
        role: "STAFF",
        acceptedPolicy: true,
      });

    expect(response.status).toBe(403);
    expect(response.body).toEqual({ message: "Forbidden" });
  });

  it("returns 400 for invalid payload", async () => {
    const response = await request(app)
      .post("/auth/register")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Ad",
        email: "not-an-email",
        password: "weak",
        role: "STAFF",
        acceptedPolicy: false,
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Validation error");
  });

  it("returns 409 when email already exists", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: "existing-user",
      name: "Existing",
      email: "existing@example.com",
      passwordHash: "hash",
      role: "STAFF",
      acceptedPolicy: true,
      policyAcceptedAt: new Date(),
      policyVersion: "1",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never);

    const response = await request(app)
      .post("/auth/register")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "New User",
        email: "existing@example.com",
        password: "SecurePass123",
        role: "STAFF",
        acceptedPolicy: true,
      });

    expect(response.status).toBe(409);
    expect(response.body).toEqual({ message: "EMAIL_ALREADY_EXISTS" });
  });

  it("returns 201 for an ADMIN creating a STAFF user", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);
    mockBcrypt.hash.mockResolvedValue("hashed_password_123" as never);
    mockPrisma.user.create.mockResolvedValue({
      id: "user-123",
      name: "New Staff",
      email: "newstaff@example.com",
      role: "STAFF",
      createdAt: new Date("2026-05-11T00:00:00.000Z"),
      updatedAt: new Date("2026-05-11T00:00:00.000Z"),
    } as never);

    const response = await request(app)
      .post("/auth/register")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "New Staff",
        email: "newstaff@example.com",
        password: "SecurePass123",
        role: "STAFF",
        acceptedPolicy: true,
      });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      message: "User created",
      user: {
        id: "user-123",
        name: "New Staff",
        email: "newstaff@example.com",
        role: "STAFF",
        createdAt: "2026-05-11T00:00:00.000Z",
        updatedAt: "2026-05-11T00:00:00.000Z",
      },
    });

    expect(mockBcrypt.hash).toHaveBeenCalledWith("SecurePass123", expect.any(Number));
    expect(mockPrisma.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ role: "STAFF", passwordHash: "hashed_password_123" }),
      }),
    );
  });
});
