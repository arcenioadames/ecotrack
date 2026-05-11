import { prisma } from "../../prisma/client";

export type CreateRefreshTokenInput = {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
};

export const RefreshTokenRepository = {
  async create(input: CreateRefreshTokenInput) {
    return prisma.refreshToken.create({
      data: {
        userId: input.userId,
        tokenHash: input.tokenHash,
        expiresAt: input.expiresAt,
      },
    });
  },

  async revoke(id: string) {
    return prisma.refreshToken.update({
      where: { id },
      data: { revoked: true },
    });
  },

  async revokeAllByUser(userId: string) {
    return prisma.refreshToken.updateMany({
      where: { userId, revoked: false },
      data: { revoked: true },
    });
  },

  async findValidToken(tokenHash: string) {
    return prisma.refreshToken.findFirst({
      where: {
        tokenHash,
        revoked: false,
        expiresAt: { gt: new Date() },
      },
    });
  },

  async rotateToken(currentId: string, newTokenHash: string, expiresAt: Date) {
    return prisma.$transaction(async (tx) => {
      const revoked = await tx.refreshToken.update({
        where: { id: currentId },
        data: { revoked: true },
      });

      const created = await tx.refreshToken.create({
        data: {
          userId: revoked.userId,
          tokenHash: newTokenHash,
          expiresAt,
        },
      });

      return { revoked, created };
    });
  },

  async deleteExpired() {
    return prisma.refreshToken.deleteMany({
      where: {
        expiresAt: { lt: new Date() },
      },
    });
  },
};

export default RefreshTokenRepository;
