import type { Request, Response } from "express";
import type { ZodIssue } from "zod";

import UserService, { UserServiceError } from "../services/user.service";
import { changePasswordSchema, setUserActiveSchema, userIdParamSchema } from "../validators/user.validator";

function validationErrorResponse(res: Response, issues: ZodIssue[]) {
  return res.status(400).json({
    message: "Validation error",
    errors: issues.map((issue) => ({
      path: issue.path,
      message: issue.message,
    })),
  });
}

function mapServiceError(err: unknown, res: Response): Response {
  if (!(err instanceof UserServiceError)) {
    return res.status(500).json({ message: "Internal server error" });
  }

  if (err.code === "USER_NOT_FOUND") {
    return res.status(404).json({ message: "User not found" });
  }

  if (err.code === "ONLY_ONE_ADMIN_REQUIRED") {
    return res.status(409).json({ message: "No se puede desactivar el único usuario ADMIN" });
  }

  if (err.code === "PASSWORD_INCORRECT") {
    return res.status(400).json({ message: "La contraseña actual es incorrecta" });
  }

  return res.status(500).json({ message: "Internal server error" });
}

export class UserController {
  /**
   * HU-15. Cambiar estado activo/inactivo.
   */
  public static async setActive(req: Request, res: Response): Promise<Response> {
    const paramsParsed = userIdParamSchema.safeParse(req.params);
    if (!paramsParsed.success) {
      return validationErrorResponse(res, paramsParsed.error.issues);
    }

    const bodyParsed = setUserActiveSchema.safeParse(req.body);
    if (!bodyParsed.success) {
      return validationErrorResponse(res, bodyParsed.error.issues);
    }

    try {
      const actorRole = (req as unknown as Request & { user?: { sub: string; role: string } }).user?.role;
      if (!actorRole) {

        return res.status(401).json({ message: "Unauthorized" });
      }

      const result = await UserService.setActive(actorRole, paramsParsed.data.id, bodyParsed.data);
      return res.status(200).json(result);
    } catch (err) {
      return mapServiceError(err, res);
    }
  }

  /**
   * HU-15. Cambiar contraseña requiriendo contraseña actual.
   */
  public static async changePassword(req: Request, res: Response): Promise<Response> {
    const paramsParsed = userIdParamSchema.safeParse(req.params);
    if (!paramsParsed.success) {
      return validationErrorResponse(res, paramsParsed.error.issues);
    }

    const bodyParsed = changePasswordSchema.safeParse(req.body);
    if (!bodyParsed.success) {
      return validationErrorResponse(res, bodyParsed.error.issues);
    }

    try {
      const actorUserId = (req as unknown as Request & { user?: { sub: string; role: string } }).user?.sub;
      const actorRole = (req as unknown as Request & { user?: { sub: string; role: string } }).user?.role;

      if (!actorUserId || !actorRole) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const result = await UserService.changePassword(actorUserId, paramsParsed.data.id, bodyParsed.data, {
        actorRole,
      });
      return res.status(200).json(result);
    } catch (err) {
      return mapServiceError(err, res);
    }
  }
}

export default UserController;

