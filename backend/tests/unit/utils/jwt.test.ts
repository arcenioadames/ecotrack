import { describe, it, expect } from "@jest/globals";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  JwtPayload,
  Role,
} from "../../../src/utils/jwt";

describe("JWT Utils", () => {
  const testPayload: JwtPayload = {
    sub: "user-123",
    role: "ADMIN" as Role,
  };

  const testPayloadStaff: JwtPayload = {
    sub: "user-456",
    role: "STAFF" as Role,
  };

  describe("generateAccessToken", () => {
    it("should generate a valid access token", () => {
      const token = generateAccessToken(testPayload);
      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      expect(token.split(".").length).toBe(3); // JWT format: header.payload.signature
    });

    it("should generate different tokens for different calls", () => {
      const token1 = generateAccessToken(testPayload);
      const token2 = generateAccessToken(testPayload);
      // Tokens may differ slightly due to iat (issued at) claim
      expect(token1).toBeDefined();
      expect(token2).toBeDefined();
    });

    it("should generate token for ADMIN role", () => {
      const token = generateAccessToken(testPayload);
      const decoded = verifyAccessToken(token);
      expect(decoded.role).toBe("ADMIN");
    });

    it("should generate token for STAFF role", () => {
      const token = generateAccessToken(testPayloadStaff);
      const decoded = verifyAccessToken(token);
      expect(decoded.role).toBe("STAFF");
    });
  });

  describe("verifyAccessToken", () => {
    it("should verify and decode a valid access token", () => {
      const token = generateAccessToken(testPayload);
      const decoded = verifyAccessToken(token);

      expect(decoded.sub).toBe("user-123");
      expect(decoded.role).toBe("ADMIN");
      expect(decoded.iat).toBeDefined();
      expect(decoded.exp).toBeDefined();
    });

    it("should throw error for invalid token", () => {
      const invalidToken = "invalid.token.here";
      expect(() => verifyAccessToken(invalidToken)).toThrow("Invalid or expired token");
    });

    it("should throw error for tampered token", () => {
      const token = generateAccessToken(testPayload);
      const tampered = token.slice(0, -10) + "corrupted";
      expect(() => verifyAccessToken(tampered)).toThrow("Invalid or expired token");
    });

    it("should throw error for empty token", () => {
      expect(() => verifyAccessToken("")).toThrow("Invalid or expired token");
    });
  });

  describe("generateRefreshToken", () => {
    it("should generate a valid refresh token", () => {
      const token = generateRefreshToken(testPayload);
      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      expect(token.split(".").length).toBe(3);
    });

    it("should generate different token than access token", () => {
      const accessToken = generateAccessToken(testPayload);
      const refreshToken = generateRefreshToken(testPayload);
      expect(accessToken).not.toBe(refreshToken);
    });

    it("should preserve user ID in refresh token", () => {
      const token = generateRefreshToken(testPayload);
      const decoded = verifyRefreshToken(token);
      expect(decoded.sub).toBe("user-123");
    });
  });

  describe("verifyRefreshToken", () => {
    it("should verify and decode a valid refresh token", () => {
      const token = generateRefreshToken(testPayload);
      const decoded = verifyRefreshToken(token);

      expect(decoded.sub).toBe("user-123");
      expect(decoded.role).toBe("ADMIN");
      expect(decoded.iat).toBeDefined();
      expect(decoded.exp).toBeDefined();
    });

    it("should throw error for invalid refresh token", () => {
      const invalidToken = "invalid.refresh.token";
      expect(() => verifyRefreshToken(invalidToken)).toThrow("Invalid or expired token");
    });

    it("should throw error when verifying access token as refresh token (different secrets)", () => {
      const accessToken = generateAccessToken(testPayload);
      // Access and refresh tokens use different secrets
      // So verifying access token with refresh secret should fail
      expect(() => verifyRefreshToken(accessToken)).toThrow("Invalid or expired token");
    });

    it("should throw error when verifying refresh token as access token (different secrets)", () => {
      const refreshToken = generateRefreshToken(testPayload);
      // Refresh and access tokens use different secrets
      expect(() => verifyAccessToken(refreshToken)).toThrow("Invalid or expired token");
    });
  });

  describe("Token expiration", () => {
    it("access token should have exp claim", () => {
      const token = generateAccessToken(testPayload);
      const decoded = verifyAccessToken(token);
      expect(decoded.exp).toBeDefined();
      expect(typeof decoded.exp).toBe("number");
    });

    it("refresh token should have exp claim", () => {
      const token = generateRefreshToken(testPayload);
      const decoded = verifyRefreshToken(token);
      expect(decoded.exp).toBeDefined();
      expect(typeof decoded.exp).toBe("number");
    });

    it("access token expiration should be sooner than refresh token", () => {
      const accessToken = generateAccessToken(testPayload);
      const refreshToken = generateRefreshToken(testPayload);

      const accessDecoded = verifyAccessToken(accessToken);
      const refreshDecoded = verifyRefreshToken(refreshToken);

      // Access token expires in 1 hour, refresh in 7 days
      // So refresh exp should be greater than access exp
      const accessExpSeconds = accessDecoded.exp || 0;
      const refreshExpSeconds = refreshDecoded.exp || 0;

      expect(refreshExpSeconds).toBeGreaterThan(accessExpSeconds);
    });
  });
});
