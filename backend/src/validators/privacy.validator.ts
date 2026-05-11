import { z } from "zod";

export const anonymizeMeSchema = z.object({
  confirmAnonymization: z.boolean().refine((value) => value === true, {
    message: "Debe confirmar la anonimización",
  }),
  reason: z
    .string()
    .trim()
    .max(255, { message: "El motivo no puede exceder 255 caracteres" })
    .optional(),
});

export const privacyAuditsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
  userId: z.string().optional(),
  policyVersion: z.string().optional(),
  actorUserId: z.string().optional(),
  targetUserId: z.string().optional(),
});

export type AnonymizeMeInput = z.infer<typeof anonymizeMeSchema>;
export type PrivacyAuditsQueryInput = z.infer<typeof privacyAuditsQuerySchema>;

export default {
  anonymizeMeSchema,
  privacyAuditsQuerySchema,
};