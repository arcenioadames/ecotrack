import { describe, it, expect } from "@jest/globals";
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
} from "../../../src/validators/auth.validator";

describe("Auth Validators", () => {
  describe("registerSchema", () => {
    const validRegisterData = {
      name: "John Doe",
      email: "john@example.com",
      password: "SecurePass123",
      role: "STAFF",
      acceptedPolicy: true,
    };

    it("should validate a correct register payload", () => {
      const result = registerSchema.safeParse(validRegisterData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validRegisterData);
      }
    });

    it("should validate an allowed role", () => {
      const result = registerSchema.safeParse({
        ...validRegisterData,
        role: "ADMIN",
      });
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual({
          ...validRegisterData,
          role: "ADMIN",
        });
        expect(result.data.role).toBe("ADMIN");
      }
    });

    it("should reject an invalid role", () => {
      const result = registerSchema.safeParse({
        ...validRegisterData,
        role: "MANAGER",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("ADMIN o STAFF");
      }
    });

    it("should reject password without uppercase letter", () => {
      const invalidData = { ...validRegisterData, password: "securepass123" };
      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("mayúscula");
      }
    });

    it("should reject password without number", () => {
      const invalidData = { ...validRegisterData, password: "SecurePass" };
      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("número");
      }
    });

    it("should reject password shorter than 8 characters", () => {
      const invalidData = { ...validRegisterData, password: "Pass12" };
      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("8 caracteres");
      }
    });

    it("should reject invalid email", () => {
      const invalidData = { ...validRegisterData, email: "not-an-email" };
      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("Email inválido");
      }
    });

    it("should reject acceptedPolicy false", () => {
      const invalidData = { ...validRegisterData, acceptedPolicy: false };
      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("política");
      }
    });

    it("should reject name shorter than 3 characters", () => {
      const invalidData = { ...validRegisterData, name: "Jo" };
      const result = registerSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("3 caracteres");
      }
    });
  });

  describe("loginSchema", () => {
    const validLoginData = {
      email: "john@example.com",
      password: "SecurePass123",
    };

    it("should validate correct login payload", () => {
      const result = loginSchema.safeParse(validLoginData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validLoginData);
      }
    });

    it("should reject invalid email", () => {
      const invalidData = { ...validLoginData, email: "invalid-email" };
      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject empty password", () => {
      const invalidData = { ...validLoginData, password: "" };
      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject missing email", () => {
      const invalidData = { password: "SecurePass123" };
      const result = loginSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should accept any password format for login", () => {
      const data = { email: "user@example.com", password: "anypassword" };
      const result = loginSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });

  describe("refreshTokenSchema", () => {
    it("should validate correct refresh token payload", () => {
      const validData = { refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." };
      const result = refreshTokenSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it("should reject empty refresh token", () => {
      const invalidData = { refreshToken: "" };
      const result = refreshTokenSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it("should reject missing refresh token", () => {
      const invalidData = {};
      const result = refreshTokenSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});
