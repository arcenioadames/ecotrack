import { prisma } from "../../prisma/client";

type RangeFilter = {
  from?: Date;
  to?: Date;
};

export const PrivacyRepository = {
  async listPolicyAcceptanceAudits(params: {
    page: number;
    limit: number;
    userId?: string;
    policyVersion?: string;
    range?: RangeFilter;
  }) {
    const where = {
      ...(params.userId ? { userId: params.userId } : {}),
      ...(params.policyVersion ? { policyVersion: params.policyVersion } : {}),
      ...(params.range?.from || params.range?.to
        ? {
            acceptedAt: {
              ...(params.range.from ? { gte: params.range.from } : {}),
              ...(params.range.to ? { lte: params.range.to } : {}),
            },
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.policyAcceptanceAudit.findMany({
        where,
        orderBy: { acceptedAt: "desc" },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
      }),
      prisma.policyAcceptanceAudit.count({ where }),
    ]);

    return { items, total };
  },

  async listAnonymizationAudits(params: {
    page: number;
    limit: number;
    targetUserId?: string;
    actorUserId?: string;
    range?: RangeFilter;
  }) {
    const where = {
      ...(params.targetUserId ? { targetUserId: params.targetUserId } : {}),
      ...(params.actorUserId ? { actorUserId: params.actorUserId } : {}),
      ...(params.range?.from || params.range?.to
        ? {
            anonymizedAt: {
              ...(params.range.from ? { gte: params.range.from } : {}),
              ...(params.range.to ? { lte: params.range.to } : {}),
            },
          }
        : {}),
    };

    const [items, total] = await Promise.all([
      prisma.userAnonymizationAudit.findMany({
        where,
        orderBy: { anonymizedAt: "desc" },
        skip: (params.page - 1) * params.limit,
        take: params.limit,
      }),
      prisma.userAnonymizationAudit.count({ where }),
    ]);

    return { items, total };
  },
};

export default PrivacyRepository;
