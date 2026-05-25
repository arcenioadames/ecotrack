import { z } from "zod";

const expirationDateSchema = z.coerce.date().refine((value) => !Number.isNaN(value.getTime()), {
  message: "La fecha de vencimiento es inválida",
});

export const productIdParamSchema = z.object({
  id: z.string().trim().min(1, { message: "Id de producto inválido" }),
});

export const productBarcodeParamSchema = z.object({
  code: z.string().trim().min(1, { message: "Código de barras inválido" }),
});

function isAllDigits(value: string): boolean {
  return /^[0-9]+$/.test(value);
}

function isValidEan13(code: string): boolean {
  if (!isAllDigits(code) || code.length !== 13) return false;
  const digits = code.split("").map((d) => Number(d));
  const check = digits[12];
  const sum = digits.slice(0, 12).reduce((acc, digit, idx) => {
    // posiciones 1..12 (idx 0..11)
    // índice par => peso 1, índice impar => peso 3
    const weight = (idx % 2 === 0) ? 1 : 3;
    return acc + digit * weight;
  }, 0);
  const computed = (10 - (sum % 10)) % 10;
  return computed === check;
}

function isValidUpcA(code: string): boolean {
  if (!isAllDigits(code) || code.length !== 12) return false;
  const digits = code.split("").map((d) => Number(d));
  const check = digits[11];
  const sum = digits.slice(0, 11).reduce((acc, digit, idx) => {
    // posiciones 1..11 (idx 0..10)
    const weight = (idx % 2 === 0) ? 3 : 1;
    return acc + digit * weight;
  }, 0);
  const computed = (10 - (sum % 10)) % 10;
  return computed === check;
}

function isLikelyCode128(code: string): boolean {
  // Code 128 suele aceptar un rango de longitud; en nuestro caso basta una validación estricta por caracteres imprimibles.
  // Nota: Code 128 usa set de caracteres con checksum binario; validar checksum completo excede un MVP.
  // Esta función asegura que no haya espacios raros y longitud razonable.
  const trimmed = code.trim();
  if (trimmed.length < 6 || trimmed.length > 32) return false;
  return /^[\x20-\x7E]+$/.test(trimmed);
}

const barcodeSchema = z
  .string()
  .trim()
  .min(3, { message: "El código de barras es obligatorio" })
  .max(120)
  .refine((value) => {
    const v = value.trim();
    return isValidEan13(v) || isValidUpcA(v) || isLikelyCode128(v);
  }, {
    message: "El código de barras no es válido (EAN-13, UPC-A o Code128)" ,
  });

export const createProductSchema = z.object({
  name: z.string().trim().min(3, { message: "El nombre debe tener al menos 3 caracteres" }).max(150),
  barcode: barcodeSchema,
  expirationDate: expirationDateSchema,
  categoryId: z.string().trim().min(1, { message: "La categoría es obligatoria" }),
});

export const updateProductSchema = z
  .object({
    name: z.string().trim().min(3, { message: "El nombre debe tener al menos 3 caracteres" }).max(150).optional(),
    barcode: z.string().trim().min(3, { message: "El código de barras es obligatorio" }).max(120).optional(),
    expirationDate: expirationDateSchema.optional(),
    categoryId: z.string().trim().min(1, { message: "La categoría es obligatoria" }).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "Debe enviar al menos un campo para actualizar",
  });

export const listProductsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().min(1).optional(),
  categoryId: z.string().trim().min(1).optional(),
  expirationFrom: z.coerce.date().optional(),
  expirationTo: z.coerce.date().optional(),
});

export const expiringProductsQuerySchema = z.object({
  days: z.coerce.number().int().min(1).max(30).default(3),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ListProductsQueryInput = z.infer<typeof listProductsQuerySchema>;
export type ExpiringProductsQueryInput = z.infer<typeof expiringProductsQuerySchema>;

export default {
  productIdParamSchema,
  createProductSchema,
  updateProductSchema,
  listProductsQuerySchema,
  expiringProductsQuerySchema,
};
