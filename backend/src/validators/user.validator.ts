import { z } from "zod";

export const userIdParamSchema = z.object({
  id: z.string().trim().min(1, { message: "Id de usuario inválido" }),
});

export const setUserActiveSchema = z.object({
  isActive: z.boolean(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, { message: "La contraseña actual es requerida" }),
  newPassword: z
    .string()
    .min(8, { message: "La nueva contraseña debe tener mínimo 8 caracteres" })
    .regex(/[A-Z]/, { message: "La nueva contraseña debe contener al menos una letra mayúscula" })
    .regex(/\d/, { message: "La nueva contraseña debe contener al menos un número" }),
});

export type SetUserActiveInput = z.infer<typeof setUserActiveSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export default {
  userIdParamSchema,
  setUserActiveSchema,
  changePasswordSchema,
};

