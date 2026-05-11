import bcrypt from "bcrypt";
import { randomUUID } from "node:crypto";

import PrivacyRepository from "../repositories/privacy.repository";
import UserRepository from "../repositories/user.repository";

type PublicAnonymizedUser = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "STAFF";
  acceptedPolicy: boolean;
  policyAcceptedAt: Date | null;
  policyVersion: string | null;
  isActive: boolean;
  anonymizedAt: Date | null;
  anonymizedReason: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type AnonymizeUserInput = {
  userId: string;
  actorUserId?: string | null;
  anonymizedIp?: string | null;
  userAgent?: string | null;
  reason?: string;
};

const ANONYMIZED_NAME = "Usuario anonimizado";
const ANONYMIZED_EMAIL_DOMAIN = "privacy.ecotrack.invalid";

function buildAnonymousEmail(): string {
  return `anon-${randomUUID()}@${ANONYMIZED_EMAIL_DOMAIN}`;
}

export class PrivacyService {
  public static async anonymizeUser(input: AnonymizeUserInput): Promise<PublicAnonymizedUser> {
    const currentUser = await UserRepository.findById(input.userId);
    if (!currentUser) {
      throw new Error("USER_NOT_FOUND");
    }

    if (currentUser.anonymizedAt) {
      throw new Error("USER_ALREADY_ANONYMIZED");
    }

    const anonymizedAt = new Date();
    const anonymizedReason = input.reason?.trim() || "RIGHT_TO_BE_FORGOTTEN";
    const replacementHash = await bcrypt.hash(
      randomUUID(),
      Math.max(Number(process.env.BCRYPT_SALT_ROUNDS) || 12, 10),
    );

    const anonymizedUser = await UserRepository.anonymizeUser(input.userId, {
      name: ANONYMIZED_NAME,
      email: buildAnonymousEmail(),
      passwordHash: replacementHash,
      isActive: false,
      policyAcceptedIp: null,
      anonymizedAt,
      anonymizedReason,
      targetUserId: input.userId,
      actorUserId: input.actorUserId ?? null,
      anonymizedIp: input.anonymizedIp ?? null,
      userAgent: input.userAgent ?? null,
      reason: anonymizedReason,
    });

    console.info(
      JSON.stringify({
        event: "user_anonymized",
        userId: input.userId,
        actorUserId: input.actorUserId ?? null,
        anonymizedAt: anonymizedAt.toISOString(),
      }),
    );

    return anonymizedUser;
  }

  public static async listPolicyAcceptanceAudits(params: {
    page: number;
    limit: number;
    userId?: string;
    policyVersion?: string;
    from?: string;
    to?: string;
  }) {
    const range = {
      ...(params.from ? { from: new Date(params.from) } : {}),
      ...(params.to ? { to: new Date(params.to) } : {}),
    };

    const result = await PrivacyRepository.listPolicyAcceptanceAudits({
      page: params.page,
      limit: params.limit,
      userId: params.userId,
      policyVersion: params.policyVersion,
      range,
    });

    return {
      items: result.items,
      pagination: {
        page: params.page,
        limit: params.limit,
        total: result.total,
        totalPages: Math.max(1, Math.ceil(result.total / params.limit)),
      },
    };
  }

  public static async listAnonymizationAudits(params: {
    page: number;
    limit: number;
    targetUserId?: string;
    actorUserId?: string;
    from?: string;
    to?: string;
  }) {
    const range = {
      ...(params.from ? { from: new Date(params.from) } : {}),
      ...(params.to ? { to: new Date(params.to) } : {}),
    };

    const result = await PrivacyRepository.listAnonymizationAudits({
      page: params.page,
      limit: params.limit,
      targetUserId: params.targetUserId,
      actorUserId: params.actorUserId,
      range,
    });

    return {
      items: result.items,
      pagination: {
        page: params.page,
        limit: params.limit,
        total: result.total,
        totalPages: Math.max(1, Math.ceil(result.total / params.limit)),
      },
    };
  }
}

export default PrivacyService;