import crypto from "node:crypto";

import RefreshTokenRepository from "../repositories/refresh-token.repository";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/jwt";

type RefreshableUser = {
  id: string;
  role: "ADMIN" | "STAFF";
};

type TokenPair = {
  accessToken: string;
  refreshToken: string;
};

const REFRESH_TTL_SECONDS = Number(process.env.REFRESH_TOKEN_TTL_SECONDS ?? 60 * 60 * 24 * 7);

function hashToken(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function getRefreshExpiresAt(): Date {
  return new Date(Date.now() + REFRESH_TTL_SECONDS * 1000);
}

function isExpired(exp?: number): boolean {
  if (!exp) return false;
  return Date.now() >= exp * 1000;
}

export class RefreshTokenService {
  public static async issueTokens(user: RefreshableUser): Promise<TokenPair> {
    const accessToken = generateAccessToken({ sub: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ sub: user.id, role: user.role });

    await RefreshTokenRepository.create({
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      expiresAt: getRefreshExpiresAt(),
    });

    console.info(JSON.stringify({ event: "login", userId: user.id }));

    return { accessToken, refreshToken };
  }

  public static async refresh(refreshToken: string): Promise<TokenPair> {
    const payload = verifyRefreshToken(refreshToken);
    const tokenHash = hashToken(refreshToken);
    const activeToken = await RefreshTokenRepository.findValidToken(tokenHash);

    if (!activeToken) {
      if (isExpired(payload.exp)) {
        throw new Error("REFRESH_TOKEN_EXPIRED");
      }

      await RefreshTokenRepository.revokeAllByUser(payload.sub);
      console.info(JSON.stringify({ event: "refresh_token_reuse_detected", userId: payload.sub }));
      throw new Error("REFRESH_TOKEN_REUSED");
    }

    const accessToken = generateAccessToken({ sub: payload.sub, role: payload.role });
    const nextRefreshToken = generateRefreshToken({ sub: payload.sub, role: payload.role });

    await RefreshTokenRepository.rotateToken(activeToken.id, hashToken(nextRefreshToken), getRefreshExpiresAt());

    console.info(JSON.stringify({ event: "refresh_token_rotation", userId: payload.sub }));

    return { accessToken, refreshToken: nextRefreshToken };
  }

  public static async logout(refreshToken: string): Promise<void> {
    const payload = verifyRefreshToken(refreshToken);
    const tokenHash = hashToken(refreshToken);
    const activeToken = await RefreshTokenRepository.findValidToken(tokenHash);

    if (!activeToken) {
      if (!isExpired(payload.exp)) {
        await RefreshTokenRepository.revokeAllByUser(payload.sub);
        console.info(JSON.stringify({ event: "token_revoked_reuse_detected", userId: payload.sub }));
        throw new Error("REFRESH_TOKEN_REUSED");
      }

      throw new Error("REFRESH_TOKEN_EXPIRED");
    }

    await RefreshTokenRepository.revoke(activeToken.id);
    console.info(JSON.stringify({ event: "logout", userId: payload.sub }));
  }

  public static async logoutAll(userId: string): Promise<void> {
    await RefreshTokenRepository.revokeAllByUser(userId);
    console.info(JSON.stringify({ event: "logout_all", userId }));
  }

  public static async logoutAllByRefreshToken(refreshToken: string): Promise<void> {
    const payload = verifyRefreshToken(refreshToken);
    await RefreshTokenService.logoutAll(payload.sub);
  }
}

export default RefreshTokenService;
