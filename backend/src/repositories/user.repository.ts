import { prisma } from "../../prisma/client";

export type CreateUserInput = {
  name: string;
  email: string;
  passwordHash: string;
  role: "ADMIN" | "STAFF";
  acceptedPolicy: boolean;
  policyAcceptedAt?: Date | null;
  policyVersion?: string | null;
  policyAcceptedIp?: string | null;
};

export type AnonymizeUserInput = {
  name: string;
  email: string;
  passwordHash: string;
  isActive: boolean;
  policyAcceptedIp?: string | null;
  anonymizedAt: Date;
  anonymizedReason?: string | null;
  targetUserId?: string;
  actorUserId?: string | null;
  anonymizedIp?: string | null;
  userAgent?: string | null;
  reason?: string | null;
};

export const UserRepository = {
  async countAdmins() {
    return prisma.user.count({
      where: {
        role: "ADMIN",
      },
    });
  },


  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  },

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
    });
  },

  async createUser(input: CreateUserInput) {
    return prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash: input.passwordHash,
        role: input.role,
        acceptedPolicy: input.acceptedPolicy,
        policyAcceptedAt: input.policyAcceptedAt ?? null,
        policyVersion: input.policyVersion ?? null,
        policyAcceptedIp: input.policyAcceptedIp ?? null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        acceptedPolicy: true,
        policyAcceptedAt: true,
        policyVersion: true,
        anonymizedAt: true,
        anonymizedReason: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  async createUserAndSavePolicyAcceptance(input: CreateUserInput & { userAgent?: string | null }) {
    return prisma.$transaction(async (tx: { user: typeof prisma.user; policyAcceptanceAudit: typeof prisma.policyAcceptanceAudit }) => {
      const user = await tx.user.create({
        data: {
          name: input.name,
          email: input.email,
          passwordHash: input.passwordHash,
          role: input.role,
          acceptedPolicy: input.acceptedPolicy,
          policyAcceptedAt: input.policyAcceptedAt ?? null,
          policyVersion: input.policyVersion ?? null,
          policyAcceptedIp: input.policyAcceptedIp ?? null,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          acceptedPolicy: true,
          policyAcceptedAt: true,
          policyVersion: true,
          anonymizedAt: true,
          anonymizedReason: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (input.policyVersion && input.policyAcceptedAt) {
        await tx.policyAcceptanceAudit.create({
          data: {
            userId: user.id,
            policyVersion: input.policyVersion,
            acceptedAt: input.policyAcceptedAt,
            acceptedIp: input.policyAcceptedIp ?? null,
            userAgent: input.userAgent ?? null,
          },
        });
      }

      return user;
    });
  },

  async updateUser(id: string, data: Record<string, unknown>) {
    return prisma.user.update({
      where: { id },
      data,
    });
  },

  async anonymizeUser(id: string, data: AnonymizeUserInput) {
    return prisma.$transaction(async (tx: { user: typeof prisma.user; userAnonymizationAudit: typeof prisma.userAnonymizationAudit }) => {
      const updated = await tx.user.update({
        where: { id },
        data: {
          name: data.name,
          email: data.email,
          passwordHash: data.passwordHash,
          isActive: data.isActive,
          policyAcceptedIp: data.policyAcceptedIp ?? null,
          anonymizedAt: data.anonymizedAt,
          anonymizedReason: data.anonymizedReason ?? null,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          acceptedPolicy: true,
          policyAcceptedAt: true,
          policyVersion: true,
          isActive: true,
          anonymizedAt: true,
          anonymizedReason: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      await tx.userAnonymizationAudit.create({
        data: {
          targetUserId: data.targetUserId ?? id,
          actorUserId: data.actorUserId ?? null,
          anonymizedAt: data.anonymizedAt,
          anonymizedIp: data.anonymizedIp ?? null,
          userAgent: data.userAgent ?? null,
          reason: data.reason ?? null,
        },
      });

      return updated;
    });
  },

  async savePolicyAcceptance(userId: string, policyVersion: string, acceptedAt: Date, acceptedIp?: string | null, userAgent?: string | null) {
    return prisma.policyAcceptanceAudit.create({
      data: {
        userId,
        policyVersion,
        acceptedAt,
        acceptedIp: acceptedIp ?? null,
        userAgent: userAgent ?? null,
      },
    });
  },

  async saveAnonymizationAudit(data: {
    targetUserId: string;
    actorUserId?: string | null;
    anonymizedAt: Date;
    anonymizedIp?: string | null;
    userAgent?: string | null;
    reason?: string | null;
  }) {
    return prisma.userAnonymizationAudit.create({
      data: {
        targetUserId: data.targetUserId,
        actorUserId: data.actorUserId ?? null,
        anonymizedAt: data.anonymizedAt,
        anonymizedIp: data.anonymizedIp ?? null,
        userAgent: data.userAgent ?? null,
        reason: data.reason ?? null,
      },
    });
  },
};

export default UserRepository;
