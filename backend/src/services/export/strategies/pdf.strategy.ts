import PDFDocument from "pdfkit";

import type { ExportableProductDto } from "../types";
import type { ExportStrategy } from "./export.strategy";

type PdfDocumentInstance = InstanceType<typeof PDFDocument>;

function createPdfBuffer(document: PdfDocumentInstance): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    document.on("data", (chunk: Buffer | string) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });
    document.on("end", () => {
      resolve(Buffer.concat(chunks));
    });
    document.on("error", reject);
  });
}

export class PdfExportStrategy implements ExportStrategy {
  public readonly format = "pdf" as const;

  public async generate(items: ExportableProductDto[]): Promise<Buffer> {
    const document = new PDFDocument({ margin: 40, size: "A4" });
    const bufferPromise = createPdfBuffer(document);

    document.fontSize(18).text("EcoTrack", { align: "center" });
    document.moveDown(0.5);
    document.fontSize(12).text(`Reporte de inventario generado el ${new Date().toISOString()}`, {
      align: "center",
    });
    document.moveDown(1);

    document.fontSize(11).text("Nombre | Código | Categoría | Vence | Estado");
    document.moveDown(0.5);

    if (items.length === 0) {
      document.text("No hay productos para exportar.");
    } else {
      for (const item of items) {
        document.text(
          `${item.name} | ${item.barcode} | ${item.categoryName} | ${item.expirationDate} | ${item.status}`,
        );
      }
    }

    document.end();
    return bufferPromise;
  }

  public getMimeType(): string {
    return "application/pdf";
  }

  public getFileExtension(): string {
    return "pdf";
  }
}

export default PdfExportStrategy;