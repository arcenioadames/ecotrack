import request from "supertest";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { generateAccessToken } from "../../src/utils/jwt";

jest.mock("../../prisma/client", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    userAnonymizationAudit: {
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

import { app } from "../../src/app";
import { prisma } from "../../prisma/client";

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

function setupTransactionMock(): void {
  const transactionMock = mockPrisma.$transaction as unknown as jest.Mock;
  transactionMock.mockImplementation(async (handler: unknown) => {
    return (handler as (tx: typeof mockPrisma) => Promise<unknown>)(mockPrisma);
  });
}

describe("DELETE /privacy/me", () => {
  const token = generateAccessToken({ sub: "user-123", role: "STAFF" });

  beforeEach(() => {
    jest.clearAllMocks();
    setupTransactionMock();
  });

  it("anonymizes the authenticated user and preserves audit trail", async () => {
    mockPrisma.user.findUnique.mockResolvedValue({
      id: "user-123",
      name: "John Doe",
      email: "john@example.com",
      passwordHash: "hashed_password_123",
      role: "STAFF",
      acceptedPolicy: true,
      policyAcceptedAt: new Date("2026-05-11T00:00:00.000Z"),
      policyVersion: "1",
      policyAcceptedIp: "127.0.0.1",
      anonymizedAt: null,
      anonymizedReason: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never);

    mockPrisma.user.update.mockResolvedValue({
      id: "user-123",
      name: "Usuario anonimizado",
      email: "anon-123@privacy.ecotrack.invalid",
      role: "STAFF",
      acceptedPolicy: true,
      policyAcceptedAt: new Date("2026-05-11T00:00:00.000Z"),
      policyVersion: "1",
      anonymizedAt: new Date("2026-05-11T00:10:00.000Z"),
      anonymizedReason: "RIGHT_TO_BE_FORGOTTEN",
      isActive: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as never);
    mockPrisma.userAnonymizationAudit.create.mockResolvedValue({} as never);

    const response = await request(app)
      .delete("/privacy/me")
      .set("Authorization", `Bearer ${token}`)
      .send({ confirmAnonymization: true, reason: "Derecho al olvido" });

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("User anonymized");
    expect(response.body.user.isActive).toBe(false);
    expect(response.body.user.name).toBe("Usuario anonimizado");
    expect(mockPrisma.userAnonymizationAudit.create).toHaveBeenCalled();
  });

  it("rejects missing confirmation", async () => {
    const response = await request(app)
      .delete("/privacy/me")
      .set("Authorization", `Bearer ${token}`)
      .send({ reason: "Derecho al olvido" });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Validation error");
  });
});