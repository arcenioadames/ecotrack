import { z } from "zod";

/**
 * Schema para el registro público (HU-01)
 * - name: obligatorio, mínimo 3 caracteres
 * - email: formato email válido
 * - password: mínimo 8, al menos 1 mayúscula y 1 número
 * - acceptedPolicy: debe ser true
 *
 * El rol NO se acepta del cliente: el registro público siempre crea STAFF (ver AuthService).
 */
export const registerSchema = z.object({
  name: z.string().min(3, { message: "El nombre debe tener al menos 3 caracteres" }),

  email: z.string().email({ message: "Email inválido" }),

  password: z
    .string()
    .min(8, { message: "La contraseña debe tener mínimo 8 caracteres" })
    .regex(/[A-Z]/, { message: "La contraseña debe contener al menos una letra mayúscula" })
    .regex(/[0-9]/, { message: "La contraseña debe contener al menos un número" }),

  // acceptedPolicy debe ser true explícitamente
  acceptedPolicy: z.boolean().refine((v) => v === true, { message: "Debe aceptar la política" }),
});

/**
 * Schema para login (HU-02)
 * - email: email válido
 * - password: no vacío (se valida fuerza en register)
 */
export const loginSchema = z.object({
  email: z.string().email({ message: "Email inválido" }),
  password: z.string().min(1, { message: "La contraseña es requerida" }),
});

/**
 * Schema para refresh token
 */
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, { message: "El refreshToken es obligatorio" }),
});

// Tipos inferidos
export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>

export default {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
};