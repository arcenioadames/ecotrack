import type { ExportProductsFilters } from "../services/export/types";

/**
 * HU-14 (IN PROGRESS / PARTIAL)
 * Servicio base para orquestar exportaciones PDF/Excel.
 *
 * Nota: este servicio NO debe reemplazar el flujo funcional usado por CI/tests.
 * El export real actual vive en `src/services/export/export.service.ts`.
 */
export class ReportService {
  public async export(_format: "pdf" | "excel", _filters: ExportProductsFilters): Promise<never> {
    // TODO HU-14: Definir contrato final y migrar gradualmente desde `src/services/export/*`.
    // TODO HU-14: agregar streaming + chunking.
    // TODO HU-14: agregar builder/cursor pagination para Prisma.

    throw new Error("HU-14 IN PROGRESS - ReportService export todavía no está habilitado");
  }
}


