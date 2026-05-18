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

export const createProductSchema = z.object({
  name: z.string().trim().min(3, { message: "El nombre debe tener al menos 3 caracteres" }).max(150),
  barcode: z.string().trim().min(3, { message: "El código de barras es obligatorio" }).max(120),
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
