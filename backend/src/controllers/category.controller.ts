import type { Request, Response } from "express";
import type { ZodIssue } from "zod";

import CategoryService, { CategoryServiceError } from "../services/category.service";
import {
  categoryIdParamSchema,
  createCategorySchema,
  updateCategorySchema,
} from "../validators/category.validator";

function validationErrorResponse(res: Response, issues: ZodIssue[]) {
  return res.status(400).json({
    message: "Validation error",
    errors: issues.map((issue) => ({
      path: issue.path,
      message: issue.message,
    })),
  });
}

function mapServiceError(err: unknown, res: Response): Response {
  if (!(err instanceof CategoryServiceError)) {
    return res.status(500).json({ message: "Internal server error" });
  }

  if (err.code === "CATEGORY_ALREADY_EXISTS") {
    return res.status(409).json({ message: "La categoría ya existe" });
  }

  if (err.code === "CATEGORY_NOT_FOUND") {
    return res.status(404).json({ message: "Categoría no encontrada" });
  }

  if (err.code === "CATEGORY_HAS_PRODUCTS") {
    return res.status(409).json({ message: "No se puede eliminar una categoría con productos asociados" });
  }

  return res.status(500).json({ message: "Internal server error" });
}

export class CategoryController {
  public static async create(req: Request, res: Response): Promise<Response> {
    const parsed = createCategorySchema.safeParse(req.body);
    if (!parsed.success) {
      return validationErrorResponse(res, parsed.error.issues);
    }

    try {
      const category = await CategoryService.create(parsed.data);
      return res.status(201).json({ message: "Category created", category });
    } catch (err) {
      return mapServiceError(err, res);
    }
  }

  public static async list(_req: Request, res: Response): Promise<Response> {
    const categories = await CategoryService.list();
    return res.status(200).json({ items: categories });
  }

  public static async update(req: Request, res: Response): Promise<Response> {
    const paramsParsed = categoryIdParamSchema.safeParse(req.params);
    if (!paramsParsed.success) {
      return validationErrorResponse(res, paramsParsed.error.issues);
    }

    const bodyParsed = updateCategorySchema.safeParse(req.body);
    if (!bodyParsed.success) {
      return validationErrorResponse(res, bodyParsed.error.issues);
    }

    try {
      const category = await CategoryService.update(paramsParsed.data.id, bodyParsed.data);
      return res.status(200).json({ message: "Category updated", category });
    } catch (err) {
      return mapServiceError(err, res);
    }
  }

  public static async delete(req: Request, res: Response): Promise<Response> {
    const paramsParsed = categoryIdParamSchema.safeParse(req.params);
    if (!paramsParsed.success) {
      return validationErrorResponse(res, paramsParsed.error.issues);
    }

    try {
      await CategoryService.delete(paramsParsed.data.id);
      return res.status(204).send();
    } catch (err) {
      return mapServiceError(err, res);
    }
  }
}

export default CategoryController;
