import { describe, it, expect, beforeEach, afterEach, jest } from "@jest/globals";
import { AuthService } from "../../../src/services/auth.service";
import { RegisterInput, LoginInput, RefreshTokenInput } from "../../../src/validators/auth.validator";
import * as jwtUtils from "../../../src/utils/jwt";

// Mock Prisma
jest.mock("../../../prisma/client", () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

// Mock bcrypt
jest.mock("bcrypt");

import { prisma } from "../../../prisma/client";
import bcrypt from "bcrypt";

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe("AuthService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("register", () => {
    const validRegisterInput: RegisterInput = {
      name: "John Doe",
      email: "john@example.com",
      password: "SecurePass123",
      role: "STAFF",
      acceptedPolicy: true,
    };

    it("should successfully register a new user with requested role", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      mockBcrypt.hash.mockResolvedValue("hashed_password_123" as never);

      mockPrisma.user.create.mockResolvedValue({
        id: "user-123",
        name: "John Doe",
        email: "john@example.com",
        role: "STAFF",
        createdAt: new Date("2026-05-11T00:00:00.000Z"),
        updatedAt: new Date("2026-05-11T00:00:00.000Z"),
      } as never);

      const result = await AuthService.register(validRegisterInput);

      expect(result).toEqual({
        id: "user-123",
        name: "John Doe",
        email: "john@example.com",
        role: "STAFF",
        createdAt: new Date("2026-05-11T00:00:00.000Z"),
        updatedAt: new Date("2026-05-11T00:00:00.000Z"),
      });

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: "john@example.com" },
      });

      expect(mockBcrypt.hash).toHaveBeenCalledWith("SecurePass123", expect.any(Number));

      expect(mockPrisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            role: "STAFF",
            passwordHash: "hashed_password_123",
          }),
        }),
      );
    });

    it("should allow ADMIN role when requested", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockBcrypt.hash.mockResolvedValue("hashed_password_admin" as never);
      mockPrisma.user.create.mockResolvedValue({
        id: "user-admin",
        name: "Admin User",
        email: "admin@example.com",
        role: "ADMIN",
        createdAt: new Date("2026-05-11T00:00:00.000Z"),
        updatedAt: new Date("2026-05-11T00:00:00.000Z"),
      } as never);

      const result = await AuthService.register({
        name: "Admin User",
        email: "admin@example.com",
        password: "SecurePass123",
        role: "ADMIN",
        acceptedPolicy: true,
      });

      expect(result.role).toBe("ADMIN");
      expect(mockPrisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ role: "ADMIN" }),
        }),
      );
    });

    it("should reject registration with duplicate email", async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        id: "existing-user",
        email: "john@example.com",
        name: "Existing User",
        role: "STAFF",
        passwordHash: "hash",
        isActive: true,
        acceptedPolicy: true,
        policyAcceptedAt: new Date(),
        policyVersion: "1",
        createdAt: new Date(),
        updatedAt: new Date(),
      } as never);

      await expect(AuthService.register(validRegisterInput)).rejects.toThrow(
        "EMAIL_ALREADY_EXISTS"
      );

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: "john@example.com" },
      });

      expect(mockPrisma.user.create).not.toHaveBeenCalled();
    });

    it("should preserve the requested STAFF role on create", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockBcrypt.hash.mockResolvedValue("hashed_password" as never);
      mockPrisma.user.create.mockResolvedValue({
        id: "user-456",
        name: "John Doe",
        email: "john@example.com",
        role: "STAFF",
        createdAt: new Date(),
        updatedAt: new Date(),
      } as never);

      await AuthService.register(validRegisterInput);

      expect(mockPrisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ role: "STAFF" }),
        }),
      );
    });
  });

  describe("login", () => {
    const validLoginInput: LoginInput = {
      email: "john@example.com",
      password: "SecurePass123",
    };

    it("should successfully login and return tokens", async () => {
      const mockUser = {
        id: "user-123",
        email: "john@example.com",
        passwordHash: "hashed_password_123",
        role: "ADMIN" as const,
        isActive: true,
        name: "John Doe",
        acceptedPolicy: true,
        policyAcceptedAt: new Date(),
        policyVersion: "1",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser as never);
      mockBcrypt.compare.mockResolvedValue(true as never);

      jest.spyOn(jwtUtils, "generateAccessToken").mockReturnValue("access_token_123");
      jest.spyOn(jwtUtils, "generateRefreshToken").mockReturnValue("refresh_token_456");

      const result = await AuthService.login(validLoginInput);

      expect(result).toEqual({
        accessToken: "access_token_123",
        refreshToken: "refresh_token_456",
      });

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: "john@example.com" },
      });

      expect(mockBcrypt.compare).toHaveBeenCalledWith("SecurePass123", "hashed_password_123");
    });

    it("should reject login with non-existent email", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(AuthService.login(validLoginInput)).rejects.toThrow("INVALID_CREDENTIALS");

      expect(mockBcrypt.compare).not.toHaveBeenCalled();
    });

    it("should reject login with incorrect password", async () => {
      const mockUser = {
        id: "user-123",
        email: "john@example.com",
        passwordHash: "hashed_password_123",
        role: "ADMIN" as const,
        isActive: true,
        name: "John Doe",
        acceptedPolicy: true,
        policyAcceptedAt: new Date(),
        policyVersion: "1",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser as never);
      mockBcrypt.compare.mockResolvedValue(false as never);

      await expect(AuthService.login(validLoginInput)).rejects.toThrow("INVALID_CREDENTIALS");
    });

    it("should reject login for inactive user", async () => {
      const inactiveUser = {
        id: "user-123",
        email: "john@example.com",
        passwordHash: "hashed_password_123",
        role: "ADMIN" as const,
        isActive: false,
        name: "John Doe",
        acceptedPolicy: true,
        policyAcceptedAt: new Date(),
        policyVersion: "1",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.user.findUnique.mockResolvedValue(inactiveUser as never);

      await expect(AuthService.login(validLoginInput)).rejects.toThrow("USER_INACTIVE");

      expect(mockBcrypt.compare).not.toHaveBeenCalled();
    });

    it("should generate tokens with correct user payload", async () => {
      const mockUser = {
        id: "user-789",
        email: "staff@example.com",
        passwordHash: "hashed_password",
        role: "STAFF" as const,
        isActive: true,
        name: "Staff User",
        acceptedPolicy: true,
        policyAcceptedAt: new Date(),
        policyVersion: "1",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser as never);
      mockBcrypt.compare.mockResolvedValue(true as never);

      const generateAccessSpy = jest
        .spyOn(jwtUtils, "generateAccessToken")
        .mockReturnValue("access_token");
      const generateRefreshSpy = jest
        .spyOn(jwtUtils, "generateRefreshToken")
        .mockReturnValue("refresh_token");

      await AuthService.login(validLoginInput);

      expect(generateAccessSpy).toHaveBeenCalledWith({
        sub: "user-789",
        role: "STAFF",
      });

      expect(generateRefreshSpy).toHaveBeenCalledWith({
        sub: "user-789",
        role: "STAFF",
      });
    });
  });

  describe("refreshToken", () => {
    const validRefreshInput: RefreshTokenInput = {
      refreshToken: "valid_refresh_token_123",
    };

    it("should successfully refresh access token", async () => {
      const mockPayload = {
        sub: "user-123",
        role: "ADMIN" as const,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
      };

      jest.spyOn(jwtUtils, "verifyRefreshToken").mockReturnValue(mockPayload);
      jest.spyOn(jwtUtils, "generateAccessToken").mockReturnValue("new_access_token");

      const result = await AuthService.refreshToken(validRefreshInput);

      expect(result).toEqual({ accessToken: "new_access_token" });

      expect(jwtUtils.verifyRefreshToken).toHaveBeenCalledWith("valid_refresh_token_123");
    });

    it("should reject invalid refresh token", async () => {
      jest.spyOn(jwtUtils, "verifyRefreshToken").mockImplementation(() => {
        throw new Error("Invalid or expired token");
      });

      await expect(AuthService.refreshToken(validRefreshInput)).rejects.toThrow(
        "Invalid or expired token"
      );
    });

    it("should generate new token with same user ID and role", async () => {
      const mockPayload = {
        sub: "user-456",
        role: "STAFF" as const,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
      };

      jest.spyOn(jwtUtils, "verifyRefreshToken").mockReturnValue(mockPayload);
      const generateSpy = jest
        .spyOn(jwtUtils, "generateAccessToken")
        .mockReturnValue("new_access_token");

      await AuthService.refreshToken(validRefreshInput);

      expect(generateSpy).toHaveBeenCalledWith({
        sub: "user-456",
        role: "STAFF",
      });
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
});
