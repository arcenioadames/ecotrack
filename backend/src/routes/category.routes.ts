import { Router } from "express";

import CategoryController from "../controllers/category.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";

export const categoryRouter = Router();

/**
 * @swagger
 * /categories:
 *   post:
 *     summary: Create category
 *     description: Creates a new category. ADMIN only.
 *     tags:
 *       - Categories
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateCategoryRequest'
 *     responses:
 *       201:
 *         description: Category created
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       409:
 *         description: Category already exists
 */
categoryRouter.post("/", authenticate, authorize("ADMIN"), CategoryController.create);

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: List categories
 *     description: Returns all categories ordered by name. ADMIN only.
 *     tags:
 *       - Categories
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Category list
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
categoryRouter.get("/", authenticate, authorize("ADMIN"), CategoryController.list);

/**
 * @swagger
 * /categories/{id}:
 *   patch:
 *     summary: Update category
 *     description: Updates category name/description. ADMIN only.
 *     tags:
 *       - Categories
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateCategoryRequest'
 *     responses:
 *       200:
 *         description: Category updated
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 *       409:
 *         description: Category conflict
 */
categoryRouter.patch("/:id", authenticate, authorize("ADMIN"), CategoryController.update);

/**
 * @swagger
 * /categories/{id}:
 *   delete:
 *     summary: Delete category
 *     description: Deletes category when no products are associated. ADMIN only.
 *     tags:
 *       - Categories
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Category deleted
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Not found
 *       409:
 *         description: Category has associated products
 */
categoryRouter.delete("/:id", authenticate, authorize("ADMIN"), CategoryController.delete);

export default categoryRouter;
