// ============================================================================
// VALIDADORES ZOD - ECOTRACK MOBILE (REACT NATIVE + EXPO)
// ============================================================================

import { z } from 'zod';

// ============================================================================
// AUTENTICACION
// ============================================================================

export const RoleSchema = z.enum(['ADMIN', 'STAFF']);

export const PasswordSchema = z
  .string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .regex(/[A-Z]/, 'La contraseña debe contener al menos una mayúscula')
  .regex(/[0-9]/, 'La contraseña debe contener al menos un número');

export const EmailSchema = z
  .string()
  .email('Email inválido');

export const RegisterSchema = z.object({
  name: z
    .string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  email: EmailSchema,
  password: PasswordSchema,
  role: RoleSchema,
  acceptedPolicy: z
    .boolean()
    .refine((val) => val === true, {
      message: 'Debes aceptar la política de privacidad',
    }),
});

export type RegisterFormData = z.infer<typeof RegisterSchema>;

export const LoginSchema = z.object({
  email: EmailSchema,
  password: z.string().min(1, 'La contraseña es requerida'),
});

export type LoginFormData = z.infer<typeof LoginSchema>;

// ============================================================================
// PRIVACIDAD
// ============================================================================

export const AnonymizationSchema = z.object({
  confirmAnonymization: z
    .boolean()
    .refine((val) => val === true, {
      message: 'Debes confirmar la eliminación de tu cuenta',
    }),
  reason: z
    .string()
    .max(255, 'La razón no puede exceder 255 caracteres')
    .optional(),
});

export type AnonymizationFormData = z.infer<typeof AnonymizationSchema>;

// ============================================================================
// AUDITORIAS
// ============================================================================

export const AuditFiltersSchema = z.object({
  page: z.number().int().min(1, 'La página debe ser mayor a 0').default(1),
  limit: z.number().int().min(1).max(100).default(20),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  userId: z.string().uuid().optional(),
  policyVersion: z.string().optional(),
  actorUserId: z.string().uuid().optional(),
  targetUserId: z.string().uuid().optional(),
});

export type AuditFiltersFormData = z.infer<typeof AuditFiltersSchema>;
