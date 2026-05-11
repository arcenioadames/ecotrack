import type { Request, Response } from "express";

import PrivacyService from "../services/privacy.service";
import { anonymizeMeSchema, privacyAuditsQuerySchema } from "../validators/privacy.validator";
import { getRequestIpFromHeaders } from "../utils/ip";

export class PrivacyController {
  public static async anonymizeMe(req: Request, res: Response): Promise<Response> {
    const parsed = anonymizeMeSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation error",
        errors: parsed.error.issues.map((issue) => ({
          path: issue.path,
          message: issue.message,
        })),
      });
    }

    const userId = req.user?.sub;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const anonymizedUser = await PrivacyService.anonymizeUser({
        userId,
        actorUserId: userId,
        anonymizedIp: getRequestIpFromHeaders(req.headers, req.ip ?? undefined),
        userAgent: req.get("user-agent") ?? null,
        reason: parsed.data.reason,
      });

      return res.status(200).json({
        message: "User anonymized",
        user: anonymizedUser,
      });
    } catch (err) {
      if (err instanceof Error && err.message === "USER_NOT_FOUND") {
        return res.status(404).json({ message: err.message });
      }

      if (err instanceof Error && err.message === "USER_ALREADY_ANONYMIZED") {
        return res.status(409).json({ message: err.message });
      }

      return res.status(500).json({ message: "Internal server error" });
    }
  }

  public static async listPolicyAudits(req: Request, res: Response): Promise<Response> {
    const parsed = privacyAuditsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation error",
        errors: parsed.error.issues.map((issue) => ({ path: issue.path, message: issue.message })),
      });
    }

    const result = await PrivacyService.listPolicyAcceptanceAudits({
      page: parsed.data.page,
      limit: parsed.data.limit,
      userId: parsed.data.userId,
      policyVersion: parsed.data.policyVersion,
      from: parsed.data.from,
      to: parsed.data.to,
    });

    return res.status(200).json(result);
  }

  public static async listAnonymizationAudits(req: Request, res: Response): Promise<Response> {
    const parsed = privacyAuditsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation error",
        errors: parsed.error.issues.map((issue) => ({ path: issue.path, message: issue.message })),
      });
    }

    const result = await PrivacyService.listAnonymizationAudits({
      page: parsed.data.page,
      limit: parsed.data.limit,
      targetUserId: parsed.data.targetUserId,
      actorUserId: parsed.data.actorUserId,
      from: parsed.data.from,
      to: parsed.data.to,
    });

    return res.status(200).json(result);
  }
}

export default PrivacyController;