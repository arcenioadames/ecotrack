import { z } from 'zod';

// ============================================================================
// Product Registration - Validaciones (HU-04.3)
// ============================================================================

const expirationDateSchema = z.preprocess(
  (value) => {
    if (value instanceof Date) {
      return value.toISOString().slice(0, 10);
    }
    return value;
  },
  z
    .string()
    .trim()
    .refine((value) => {
      const parsed = new Date(value);
      return !Number.isNaN(parsed.getTime());
    }, { message: 'La fecha de vencimiento es inválida' })
    .transform((value) => new Date(value)),
);

export const productRegistrationSchema = z
  .object({
    name: z.string().trim().min(3, { message: 'El nombre debe tener al menos 3 caracteres' }).max(150, { message: 'El nombre es muy largo' }),
    barcode: z
      .string()
      .trim()
      .min(3, { message: 'El código de barras es obligatorio' })
      .max(128, { message: 'El código de barras es muy largo' }),
    expirationDate: expirationDateSchema,
    categoryId: z.string().trim().min(1, { message: 'La categoría es obligatoria' }),
  })
  .strict();

export type ProductRegistrationFormData = z.infer<typeof productRegistrationSchema>;

