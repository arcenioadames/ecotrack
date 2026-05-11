import request from "supertest";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";

import { generateAccessToken } from "../../src/utils/jwt";

jest.mock("../../prisma/client", () => ({
  prisma: {
    policyAcceptanceAudit: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    userAnonymizationAudit: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  },
}));

import { app } from "../../src/app";
import { prisma } from "../../prisma/client";

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe("GET /privacy/audits/*", () => {
  const adminToken = generateAccessToken({ sub: "admin-1", role: "ADMIN" });
  const staffToken = generateAccessToken({ sub: "staff-1", role: "STAFF" });

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma.policyAcceptanceAudit.findMany.mockResolvedValue([] as never);
    mockPrisma.policyAcceptanceAudit.count.mockResolvedValue(0 as never);
    mockPrisma.userAnonymizationAudit.findMany.mockResolvedValue([] as never);
    mockPrisma.userAnonymizationAudit.count.mockResolvedValue(0 as never);
  });

  it("returns 403 for STAFF on policy audits", async () => {
    const response = await request(app)
      .get("/privacy/audits/policy")
      .set("Authorization", `Bearer ${staffToken}`);

    expect(response.status).toBe(403);
    expect(response.body.message).toBe("Forbidden");
  });

  it("lists policy audits for ADMIN with pagination", async () => {
    mockPrisma.policyAcceptanceAudit.findMany.mockResolvedValue([
      {
        id: "audit-1",
        userId: "user-1",
        policyVersion: "1",
        acceptedAt: new Date("2026-05-11T00:00:00.000Z"),
        acceptedIp: "127.0.0.1",
        userAgent: "test-agent",
        createdAt: new Date("2026-05-11T00:00:00.000Z"),
      },
    ] as never);
    mockPrisma.policyAcceptanceAudit.count.mockResolvedValue(1 as never);

    const response = await request(app)
      .get("/privacy/audits/policy?page=1&limit=10&policyVersion=1")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.pagination.total).toBe(1);
    expect(response.body.items).toHaveLength(1);
  });

  it("lists anonymization audits for ADMIN", async () => {
    mockPrisma.userAnonymizationAudit.findMany.mockResolvedValue([
      {
        id: "anon-1",
        targetUserId: "user-1",
        actorUserId: "admin-1",
        anonymizedAt: new Date("2026-05-11T00:10:00.000Z"),
        anonymizedIp: "127.0.0.1",
        userAgent: "test-agent",
        reason: "RIGHT_TO_BE_FORGOTTEN",
        createdAt: new Date("2026-05-11T00:10:00.000Z"),
      },
    ] as never);
    mockPrisma.userAnonymizationAudit.count.mockResolvedValue(1 as never);

    const response = await request(app)
      .get("/privacy/audits/anonymization?page=1&limit=10&targetUserId=user-1")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.pagination.total).toBe(1);
    expect(response.body.items[0].targetUserId).toBe("user-1");
  });
});
