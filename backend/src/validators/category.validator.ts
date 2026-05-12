import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().trim().min(3, { message: "El nombre debe tener al menos 3 caracteres" }).max(100),
  description: z.string().trim().max(255).optional(),
});

export const updateCategorySchema = z
  .object({
    name: z.string().trim().min(3, { message: "El nombre debe tener al menos 3 caracteres" }).max(100).optional(),
    description: z.string().trim().max(255).nullable().optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "Debe enviar al menos un campo para actualizar",
  });

export const categoryIdParamSchema = z.object({
  id: z.string().trim().min(1, { message: "Id de categoría inválido" }),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

export default {
  createCategorySchema,
  updateCategorySchema,
  categoryIdParamSchema,
};
