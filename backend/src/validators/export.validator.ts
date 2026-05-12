import { z } from "zod";

export const exportProductsQuerySchema = z.object({
  format: z.enum(["pdf", "excel"]),
  search: z.string().trim().min(1).optional(),
  categoryId: z.string().trim().min(1).optional(),
  expirationFrom: z.coerce.date().optional(),
  expirationTo: z.coerce.date().optional(),
  status: z.enum(["expired", "all"]).default("expired"),
});

export type ExportProductsQueryInput = z.infer<typeof exportProductsQuerySchema>;

export default {
  exportProductsQuerySchema,
};
