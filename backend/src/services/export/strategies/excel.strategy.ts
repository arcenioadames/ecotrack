import ExcelJS from "exceljs";

import type { ExportableProductDto } from "../types";
import type { ExportStrategy } from "./export.strategy";

export class ExcelExportStrategy implements ExportStrategy {
  public readonly format = "excel" as const;

  public async generate(items: ExportableProductDto[]): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Inventario");

    worksheet.columns = [
      { header: "Nombre", key: "name", width: 28 },
      { header: "Código de barras", key: "barcode", width: 18 },
      { header: "Categoría", key: "categoryName", width: 22 },
      { header: "Vencimiento", key: "expirationDate", width: 24 },
      { header: "Estado", key: "status", width: 14 },
    ];

    worksheet.getRow(1).font = { bold: true };
    worksheet.addRows(
      items.map((item) => ({
        name: item.name,
        barcode: item.barcode,
        categoryName: item.categoryName,
        expirationDate: item.expirationDate,
        status: item.status,
      })),
    );

    const arrayBuffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(arrayBuffer);
  }

  public getMimeType(): string {
    return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  }

  public getFileExtension(): string {
    return "xlsx";
  }
}

export default ExcelExportStrategy;