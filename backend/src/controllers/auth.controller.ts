import { Request, Response } from "express";
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
} from "../validators/auth.validator";
import AuthService from "../services/auth.service";
import RefreshTokenService from "../services/refresh-token.service";
import { getRequestIpFromHeaders } from "../utils/ip";
import { buildClearRefreshCookie, buildRefreshCookie, getRefreshTokenFromRequest, shouldUseRefreshCookie } from "../utils/cookie";

export class AuthController {
  public static async register(req: Request, res: Response): Promise<Response> {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation error",
        errors: parsed.error.issues.map((issue) => ({
          path: issue.path,
          message: issue.message,
        })),
      });
    }

    try {
      const user = await AuthService.register(parsed.data, {
        policyAcceptedIp: getRequestIpFromHeaders(req.headers, req.ip ?? undefined),
        policyAcceptedUserAgent: req.get("user-agent") ?? null,
      });
      return res.status(201).json({ message: "User created", user });
    } catch (err) {
      if (err instanceof Error && err.message === "EMAIL_ALREADY_EXISTS") {
        return res.status(409).json({ message: err.message });
      }

      return res.status(500).json({ message: "Internal server error" });
    }
  }

  public static async login(req: Request, res: Response): Promise<Response> {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation error",
        errors: parsed.error.issues.map((issue) => ({
          path: issue.path,
          message: issue.message,
        })),
      });
    }

    try {
      const tokens = await AuthService.login(parsed.data);
      if (shouldUseRefreshCookie()) {
        res.setHeader("Set-Cookie", buildRefreshCookie(tokens.refreshToken));
      }
      return res.status(200).json(tokens);
    } catch (err) {
      if (err instanceof Error && (err.message === "INVALID_CREDENTIALS" || err.message === "USER_INACTIVE")) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      return res.status(500).json({ message: "Internal server error" });
    }
  }

  public static async refresh(req: Request, res: Response): Promise<Response> {
    const parsed = refreshTokenSchema.safeParse(req.body ?? {});
    if (!parsed.success) {
      return res.status(400).json({
        message: "Validation error",
        errors: parsed.error.issues.map((issue) => ({
          path: issue.path,
          message: issue.message,
        })),
      });
    }

    try {
      const refreshToken = getRefreshTokenFromRequest(parsed.data.refreshToken, req.headers.cookie ?? null);
      if (!refreshToken) {
        return res.status(400).json({ message: "refreshToken is required" });
      }

      const tokens = await RefreshTokenService.refresh(refreshToken);
      if (shouldUseRefreshCookie()) {
        res.setHeader("Set-Cookie", buildRefreshCookie(tokens.refreshToken));
      }
      return res.status(200).json(tokens);
    } catch (err) {
      if (err instanceof Error && err.message === "REFRESH_TOKEN_EXPIRED") {
        return res.status(401).json({ message: "Token expired" });
      }

      if (err instanceof Error && err.message === "REFRESH_TOKEN_REUSED") {
        return res.status(401).json({ message: "Token revoked" });
      }

      return res.status(401).json({ message: "Invalid token" });
    }
  }

  public static async logout(req: Request, res: Response): Promise<Response> {
    const refreshToken = getRefreshTokenFromRequest(req.body?.refreshToken, req.headers.cookie ?? null);
    if (!refreshToken) {
      return res.status(400).json({ message: "refreshToken is required" });
    }

    try {
      await RefreshTokenService.logout(refreshToken);
      if (shouldUseRefreshCookie()) {
        res.setHeader("Set-Cookie", buildClearRefreshCookie());
      }
      return res.status(200).json({ message: "Logged out" });
    } catch (err) {
      if (err instanceof Error && err.message === "REFRESH_TOKEN_EXPIRED") {
        return res.status(401).json({ message: "Token expired" });
      }

      if (err instanceof Error && err.message === "REFRESH_TOKEN_REUSED") {
        return res.status(401).json({ message: "Token revoked" });
      }

      return res.status(401).json({ message: "Invalid token" });
    }
  }

  public static async logoutAll(req: Request, res: Response): Promise<Response> {
    const refreshToken = getRefreshTokenFromRequest(req.body?.refreshToken, req.headers.cookie ?? null);
    if (!refreshToken) {
      return res.status(400).json({ message: "refreshToken is required" });
    }

    try {
      await RefreshTokenService.logoutAllByRefreshToken(refreshToken);
      if (shouldUseRefreshCookie()) {
        res.setHeader("Set-Cookie", buildClearRefreshCookie());
      }
      return res.status(200).json({ message: "All sessions revoked" });
    } catch {
      return res.status(401).json({ message: "Invalid token" });
    }
  }
}

export default AuthController;
