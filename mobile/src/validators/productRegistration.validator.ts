import { z } from 'zod';

// ============================================================================
// Product Registration - Validaciones (HU-04.3)
// ============================================================================

const expirationDateSchema = z.coerce.date().refine(
  (value) => !Number.isNaN(value.getTime()),
  { message: 'La fecha de vencimiento es inválida' },
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

