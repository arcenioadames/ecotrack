import { Request, Response } from "express";
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
} from "../validators/auth.validator";
import AuthService from "../services/auth.service";

export class AuthController {
  public static async register(req: Request, res: Response): Promise<Response> {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Validation error", errors: parsed.error.format() });
    }

    try {
      const user = await AuthService.register(parsed.data);
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
      return res.status(400).json({ message: "Validation error", errors: parsed.error.format() });
    }

    try {
      const tokens = await AuthService.login(parsed.data);
      return res.status(200).json(tokens);
    } catch (err) {
      if (err instanceof Error) {
        if (err.message === "INVALID_CREDENTIALS") {
          return res.status(401).json({ message: err.message });
        }

        if (err.message === "USER_INACTIVE") {
          return res.status(403).json({ message: err.message });
        }
      }

      return res.status(500).json({ message: "Internal server error" });
    }
  }

  public static async refresh(req: Request, res: Response): Promise<Response> {
    const parsed = refreshTokenSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Validation error", errors: parsed.error.format() });
    }

    try {
      const { accessToken } = await AuthService.refreshToken(parsed.data);
      return res.status(200).json({ accessToken });
    } catch {
      return res.status(401).json({ message: "Invalid token" });
    }
  }

  /**
   * Reservado para Sprint 2+: creación de usuarios ADMIN por otro administrador.
   * Hoy responde 501 para fijar el contrato HTTP sin exponer elevación pública.
   */
  public static async registerAdminPlaceholder(_req: Request, res: Response): Promise<Response> {
    return res.status(501).json({ message: "Not implemented: admin user provisioning" });
  }
}

export default AuthController;
