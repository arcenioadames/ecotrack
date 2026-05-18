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

// ============================================================================
// ESCANEO DE CODIGOS DE BARRAS
// ============================================================================

import { detectBarcodeFormat, validateBarcodeChecksum } from '@services/barcode.service';

export const BarcodeFormatSchema = z.enum(['ean13', 'upca', 'code128', 'unknown']).refine(
  (format) => format !== 'unknown',
  {
    message: 'Formato de código de barras no soportado',
  },
);

/**
 * Validador base para un código de barras
 * Valida:
 * - Longitud mínima y máxima
 * - Formato válido (EAN-13, UPC-A, Code128)
 * - Checksum
 */
export const BarcodeSchema = z
  .string()
  .trim()
  .min(3, 'Código de barras muy corto')
  .max(128, 'Código de barras muy largo')
  .refine(
    (value) => {
      const format = detectBarcodeFormat(value);
      return format !== 'unknown';
    },
    {
      message: 'Formato de código de barras no soportado. Usa EAN-13, UPC-A o Code128.',
    },
  )
  .refine(
    (value) => validateBarcodeChecksum(value),
    {
      message: 'Código de barras inválido: checksum no válido',
    },
  );

/**
 * Esquema para datos de código de barras escaneado
 */
export const ScannedBarcodeSchema = z.object({
  value: BarcodeSchema,
  format: BarcodeFormatSchema,
  timestamp: z.number().positive('Timestamp debe ser positivo'),
});

export type ScannedBarcode = z.infer<typeof ScannedBarcodeSchema>;

/**
 * Esquema para errores de scanner
 */
export const ScannerErrorSchema = z.object({
  code: z.enum(['permission_denied', 'camera_error', 'invalid_format', 'unknown']),
  message: z.string().min(1, 'Mensaje de error requerido'),
});

export type ScannerErrorType = z.infer<typeof ScannerErrorSchema>;

