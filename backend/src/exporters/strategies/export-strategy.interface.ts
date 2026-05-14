import type { ExportableProductDto } from "../../services/export/types";

export type ExportFormat = "pdf" | "excel";

export interface ExportStrategy {
  readonly format: ExportFormat;
  generate(items: ExportableProductDto[]): Promise<Buffer>;
  getMimeType(): string;
  getFileExtension(): string;
}

