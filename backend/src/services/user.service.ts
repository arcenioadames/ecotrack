import bcrypt from "bcrypt";

import UserRepository from "../repositories/user.repository";
import RefreshTokenRepository from "../repositories/refresh-token.repository";
import type { ChangePasswordInput, SetUserActiveInput } from "../validators/user.validator";

type UserRole = "ADMIN" | "STAFF";

type UserServiceErrorCode =
  | "USER_NOT_FOUND"
  | "ONLY_ONE_ADMIN_REQUIRED"
  | "PASSWORD_INCORRECT";

export class UserServiceError extends Error {
  public readonly code: UserServiceErrorCode;

  constructor(code: UserServiceErrorCode) {
    super(code);
    this.code = code;
  }
}

function getSaltRounds(): number {
  const envRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;
  return Math.max(envRounds, 10);
}

export class UserService {
  /**
   * HU-15. Desactivar usuario y revocar refresh tokens para que no pueda volver a renovar tokens.
   */
  public static async setActive(actorUserRole: UserRole, targetUserId: string, input: SetUserActiveInput) {
    // Por seguridad adicional, siempre requerimos ADMIN desde el controlador/router,
    // pero esta función asume que el actor ya fue autorizado.

    const target = await UserRepository.findById(targetUserId);
    if (!target) {
      throw new UserServiceError("USER_NOT_FOUND");
    }

    if (target.role === "ADMIN" && input.isActive === false) {
      // Regla: no permitir desactivar el único ADMIN.
      // Necesitamos contar admins en la BD.
      const admins = await UserRepository.countAdmins();
      if (admins === 1) {
        throw new UserServiceError("ONLY_ONE_ADMIN_REQUIRED");
      }

    }

    await UserRepository.updateUser(targetUserId, {
      isActive: input.isActive,
    });

    // Revocar refresh tokens para que el usuario no pueda renovar access tokens.
    if (input.isActive === false) {
      await RefreshTokenRepository.revokeAllByUser(targetUserId);
    }

    return {
      id: target.id,
      isActive: input.isActive,
    };
  }

  /**
   * HU-15. Cambio de contraseña validando contraseña actual.
   */
  public static async changePassword(actorUserId: string, targetUserId: string, input: ChangePasswordInput, {
    actorRole: _actorRole,
  }: { actorRole: UserRole }) {
    // En HU-15 el cambio de contraseña se describe para un Admin cambiando su propia contraseña o perfil.
    // Restringimos a que solo se permita para el usuario a sí mismo (targetUserId === actorUserId)
    // o si deseas una extensión para admin override, se ajusta aquí.
    if (actorUserId !== targetUserId) {
      // Para esta versión mínima, no permitimos que un Admin cambie contraseña ajena.
      throw new UserServiceError("USER_NOT_FOUND");
    }

    const user = await UserRepository.findById(targetUserId);
    if (!user) {
      throw new UserServiceError("USER_NOT_FOUND");
    }

    const match = await bcrypt.compare(input.currentPassword, user.passwordHash as string);
    if (!match) {
      throw new UserServiceError("PASSWORD_INCORRECT");
    }

    const hashed = await bcrypt.hash(input.newPassword, getSaltRounds());
    await UserRepository.updateUser(targetUserId, {
      passwordHash: hashed,
    });

    // Si se cambia contraseña, revocamos refresh tokens para forzar re-login.
    await RefreshTokenRepository.revokeAllByUser(targetUserId);

    return { message: "Password updated" };
  }
}

export default UserService;

