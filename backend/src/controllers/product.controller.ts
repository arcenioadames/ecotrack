import type { Request, Response } from "express";
import type { ZodIssue } from "zod";

import ProductService, { ProductServiceError } from "../services/product.service";
import ExportService from "../services/export/export.service";

import {

  createProductSchema,
  expiringProductsQuerySchema,
  listProductsQuerySchema,
  productBarcodeParamSchema,
  productIdParamSchema,
  updateProductSchema,
} from "../validators/product.validator";

import { exportProductsQuerySchema } from "../validators/export.validator";

function validationErrorResponse(res: Response, issues: ZodIssue[]) {
  return res.status(400).json({
    message: "Validation error",
    errors: issues.map((issue) => ({
      path: issue.path,
      message: issue.message,
    })),
  });
}

function mapProductError(err: unknown, res: Response): Response {
  if (!(err instanceof ProductServiceError)) {
    return res.status(500).json({ message: "Internal server error" });
  }

  if (err.code === "PRODUCT_NOT_FOUND") {
    return res.status(404).json({ message: err.code });
  }

  if (err.code === "PRODUCT_BARCODE_ALREADY_EXISTS") {
    return res.status(409).json({ message: err.code });
  }

  if (err.code === "CATEGORY_NOT_FOUND") {
    return res.status(404).json({ message: err.code });
  }

  if (err.code === "INVALID_EXPIRATION_DATE" || err.code === "INVALID_DATE_RANGE") {
    return res.status(400).json({ message: err.code });
  }

  return res.status(500).json({ message: "Internal server error" });
}

export class ProductController {
  public static async create(req: Request, res: Response): Promise<Response> {
    const parsed = createProductSchema.safeParse(req.body);
    if (!parsed.success) {
      return validationErrorResponse(res, parsed.error.issues);
    }

    const currentUserId = req.user?.sub;
    if (!currentUserId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const product = await ProductService.create(parsed.data, currentUserId);
      return res.status(201).json({ message: "Product created", product });
    } catch (err) {
      return mapProductError(err, res);
    }
  }

  public static async list(req: Request, res: Response): Promise<Response> {
    const parsed = listProductsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return validationErrorResponse(res, parsed.error.issues);
    }

    try {
      const result = await ProductService.list(parsed.data);
      return res.status(200).json(result);
    } catch (err) {
      return mapProductError(err, res);
    }
  }

  public static async getById(req: Request, res: Response): Promise<Response> {
    const parsedParams = productIdParamSchema.safeParse(req.params);
    if (!parsedParams.success) {
      return validationErrorResponse(res, parsedParams.error.issues);
    }

    try {
      const product = await ProductService.getById(parsedParams.data.id);
      return res.status(200).json({ product });
    } catch (err) {
      return mapProductError(err, res);
    }
  }

  public static async update(req: Request, res: Response): Promise<Response> {
    const parsedParams = productIdParamSchema.safeParse(req.params);
    if (!parsedParams.success) {
      return validationErrorResponse(res, parsedParams.error.issues);
    }

    const parsedBody = updateProductSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return validationErrorResponse(res, parsedBody.error.issues);
    }

    try {
      const product = await ProductService.update(parsedParams.data.id, parsedBody.data);
      return res.status(200).json({ message: "Product updated", product });
    } catch (err) {
      return mapProductError(err, res);
    }
  }

  public static async delete(req: Request, res: Response): Promise<Response> {
    const parsedParams = productIdParamSchema.safeParse(req.params);
    if (!parsedParams.success) {
      return validationErrorResponse(res, parsedParams.error.issues);
    }

    try {
      await ProductService.delete(parsedParams.data.id);
      return res.status(204).send();
    } catch (err) {
      return mapProductError(err, res);
    }
  }

  public static async expiring(req: Request, res: Response): Promise<Response> {
    const parsed = expiringProductsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return validationErrorResponse(res, parsed.error.issues);
    }

    const items = await ProductService.listExpiring(parsed.data.days);
    return res.status(200).json({
      items,
      meta: {
        days: parsed.data.days,
      },
    });
  }

  public static async getByBarcode(req: Request, res: Response): Promise<Response> {
    const parsedParams = productBarcodeParamSchema.safeParse(req.params);
    if (!parsedParams.success) {
      return validationErrorResponse(res, parsedParams.error.issues);
    }

    try {
      const product = await ProductService.getByBarcode(parsedParams.data.code);
      return res.status(200).json({ product });
    } catch (err) {
      return mapProductError(err, res);
    }
  }

  public static async export(req: Request, res: Response): Promise<Response> {
    const parsed = exportProductsQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return validationErrorResponse(res, parsed.error.issues);
    }

    // MVP export implementation (HU-14 IN PROGRESS)
    try {
      const exportService = new ExportService();
      const result = await exportService.export(parsed.data.format, {
        search: parsed.data.search,
        categoryId: parsed.data.categoryId,
        expirationFrom: parsed.data.expirationFrom,
        expirationTo: parsed.data.expirationTo,
        status: parsed.data.status,
      });

      res.setHeader("Content-Disposition", `attachment; filename="${result.fileName}"`);
      res.setHeader("Content-Type", result.mimeType);
      res.setHeader("Content-Length", String(result.payload.byteLength));

      return res.status(200).send(result.payload);
    } catch {
      return res.status(501).json({ message: "HU-14 export feature pending implementation" });
    }
  }
}

export default ProductController;

