import request from "supertest";
import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { generateRefreshToken } from "../../src/utils/jwt";

jest.mock("../../prisma/client", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock("bcrypt");

import { app } from "../../src/app";
import { prisma } from "../../prisma/client";
import bcrypt from "bcrypt";

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe("POST /auth/login and /auth/refresh", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 200 with accessToken and refreshToken for valid credentials", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: "user-123",
      name: "John Doe",
      email: "john@example.com",
      passwordHash: "hashed_password_123",
      role: "ADMIN",
      acceptedPolicy: true,
      policyAcceptedAt: new Date(),
      policyVersion: "1",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never);
    mockBcrypt.compare.mockResolvedValue(true as never);

    const response = await request(app).post("/auth/login").send({
      email: "john@example.com",
      password: "SecurePass123",
    });

    expect(response.status).toBe(200);
    expect(response.body.accessToken).toBeDefined();
    expect(response.body.refreshToken).toBeDefined();
    expect(typeof response.body.accessToken).toBe("string");
    expect(typeof response.body.refreshToken).toBe("string");
  });

  it("returns 401 generic for non-existent email", async () => {
    mockPrisma.user.findUnique.mockResolvedValue(null);

    const response = await request(app).post("/auth/login").send({
      email: "missing@example.com",
      password: "SecurePass123",
    });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: "Invalid credentials" });
  });

  it("returns 401 generic for wrong password", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: "user-123",
      name: "John Doe",
      email: "john@example.com",
      passwordHash: "hashed_password_123",
      role: "STAFF",
      acceptedPolicy: true,
      policyAcceptedAt: new Date(),
      policyVersion: "1",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never);
    mockBcrypt.compare.mockResolvedValue(false as never);

    const response = await request(app).post("/auth/login").send({
      email: "john@example.com",
      password: "WrongPass123",
    });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: "Invalid credentials" });
  });

  it("returns 401 generic for inactive user", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: "user-123",
      name: "John Doe",
      email: "john@example.com",
      passwordHash: "hashed_password_123",
      role: "STAFF",
      acceptedPolicy: true,
      policyAcceptedAt: new Date(),
      policyVersion: "1",
      isActive: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never);

    const response = await request(app).post("/auth/login").send({
      email: "john@example.com",
      password: "SecurePass123",
    });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: "Invalid credentials" });
  });

  it("refreshes access token with a valid refresh token", async () => {
    const refreshToken = generateRefreshToken({ sub: "user-123", role: "ADMIN" });

    const response = await request(app).post("/auth/refresh").send({
      refreshToken,
    });

    expect(response.status).toBe(200);
    expect(response.body.accessToken).toBeDefined();
    expect(typeof response.body.accessToken).toBe("string");
  });

  it("returns 401 for an invalid refresh token", async () => {
    const response = await request(app).post("/auth/refresh").send({
      refreshToken: "invalid.refresh.token",
    });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: "Invalid token" });
  });
});