import type { ExportableProductDto } from "../../services/export/types";

import type { ExportStrategy } from "./export-strategy.interface";

export class ExcelExportStrategy implements ExportStrategy {
  public readonly format = "excel" as const;

  public async generate(items: ExportableProductDto[]): Promise<Buffer> {
    // TODO HU-14: implementar export Excel con streaming / chunking.
    // Nota HU-14: esta clase es SOLO preparatoria.
    // El export funcional actual para CI/tests vive en `src/services/export/*`.
    // Esta implementación devuelve un Buffer mínimo para no romper compile/runtime
    // si alguien la instancia accidentalmente durante la transición.

    const text = `HU-14 IN PROGRESS - Excel export pendiente. items=${items.length}`;
    return Buffer.from(text, "utf-8");
  }

  public getMimeType(): string {
    return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  }

  public getFileExtension(): string {
    return "xlsx";
  }
}


