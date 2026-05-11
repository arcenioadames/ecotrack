import request from "supertest";
import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import { generateRefreshToken } from "../../src/utils/jwt";

jest.mock("../../prisma/client", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
    },
    refreshToken: {
      create: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      updateMany: jest.fn(),
      deleteMany: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

jest.mock("bcrypt");

import { app } from "../../src/app";
import { prisma } from "../../prisma/client";
import bcrypt from "bcrypt";

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

function setupTransactionMock(): void {
  const transactionMock = mockPrisma.$transaction as unknown as jest.Mock;
  transactionMock.mockImplementation(async (handler: unknown) => {
    return (handler as (tx: typeof mockPrisma) => Promise<unknown>)(mockPrisma);
  });
}

function mockAuthenticatedUser(role: "ADMIN" | "STAFF" = "ADMIN") {
  mockPrisma.user.findUnique.mockResolvedValue({
    id: "user-123",
    name: "John Doe",
    email: "john@example.com",
    passwordHash: "hashed_password_123",
    role,
    acceptedPolicy: true,
    policyAcceptedAt: new Date(),
    policyVersion: "1",
    policyAcceptedIp: "127.0.0.1",
    anonymizedAt: null,
    anonymizedReason: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as never);
}

describe("POST /auth/login, /auth/refresh, /auth/logout, /auth/logout-all", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setupTransactionMock();
    mockPrisma.refreshToken.create.mockResolvedValue({
      id: "rt-1",
      userId: "user-123",
      tokenHash: "token-hash",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      revoked: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never);
    mockPrisma.refreshToken.findFirst.mockResolvedValue({
      id: "rt-1",
      userId: "user-123",
      tokenHash: "token-hash",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      revoked: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never);
    mockPrisma.refreshToken.update.mockResolvedValue({
      id: "rt-1",
      userId: "user-123",
      tokenHash: "token-hash",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      revoked: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never);
    mockPrisma.refreshToken.updateMany.mockResolvedValue({ count: 1 } as never);
    mockBcrypt.compare.mockResolvedValue(true as never);
  });

  it("returns 200 with accessToken and refreshToken for valid credentials", async () => {
    mockAuthenticatedUser();

    const response = await request(app).post("/auth/login").send({
      email: "john@example.com",
      password: "SecurePass123",
    });

    expect(response.status).toBe(200);
    expect(response.body.accessToken).toBeDefined();
    expect(response.body.refreshToken).toBeDefined();
    expect(typeof response.body.accessToken).toBe("string");
    expect(typeof response.body.refreshToken).toBe("string");
    expect(mockPrisma.refreshToken.create).toHaveBeenCalled();
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

  it("refreshes access and refresh token with a valid refresh token", async () => {
    mockAuthenticatedUser();
    const refreshToken = generateRefreshToken({ sub: "user-123", role: "ADMIN" });

    const response = await request(app).post("/auth/refresh").send({
      refreshToken,
    });

    expect(response.status).toBe(200);
    expect(response.body.accessToken).toBeDefined();
    expect(response.body.refreshToken).toBeDefined();
    expect(mockPrisma.refreshToken.update).toHaveBeenCalled();
  });

  it("rejects a revoked refresh token and fails closed", async () => {
    mockAuthenticatedUser();
    const refreshToken = generateRefreshToken({ sub: "user-123", role: "ADMIN" });
    mockPrisma.refreshToken.findFirst.mockResolvedValue(null);

    const response = await request(app).post("/auth/refresh").send({
      refreshToken,
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Token revoked");
    expect(mockPrisma.refreshToken.updateMany).toHaveBeenCalled();
  });

  it("returns 200 on logout and revokes current token", async () => {
    mockAuthenticatedUser();
    const refreshToken = generateRefreshToken({ sub: "user-123", role: "ADMIN" });

    const response = await request(app).post("/auth/logout").send({
      refreshToken,
    });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Logged out");
    expect(mockPrisma.refreshToken.update).toHaveBeenCalled();
  });

  it("returns 200 on logout-all and revokes all sessions", async () => {
    mockAuthenticatedUser();
    const refreshToken = generateRefreshToken({ sub: "user-123", role: "ADMIN" });

    const response = await request(app).post("/auth/logout-all").send({
      refreshToken,
    });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("All sessions revoked");
    expect(mockPrisma.refreshToken.updateMany).toHaveBeenCalled();
  });
});
