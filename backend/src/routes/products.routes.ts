import { Router } from "express";

import ProductController from "../controllers/product.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";

export const productsRouter = Router();

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Create product
 *     description: Creates a product associated to the authenticated user.
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Product created
 */
productsRouter.post("/", authenticate, authorize("ADMIN", "STAFF"), ProductController.create);

/**
 * @swagger
 * /products:
 *   get:
 *     summary: List products
 *     description: Returns paginated products with optional filters.
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Product list
 */
productsRouter.get("/", authenticate, authorize("ADMIN", "STAFF"), ProductController.list);

/**
 * @swagger
 * /products/expiring:
 *   get:
 *     summary: List expiring products
 *     description: Returns products expiring in N days (includes expired if within threshold rule).
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Expiring products list
 */
productsRouter.get("/expiring", authenticate, authorize("ADMIN", "STAFF"), ProductController.expiring);

/**
 * @swagger
 * /products/export:
 *   get:
 *     summary: Export products report
 *     description: Exports the current filtered product set as PDF or Excel. ADMIN only.
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: File download
 */
// TODO HU-14: exportación PDF/Excel pendiente. Endpoint responde 501 por ahora.
productsRouter.get("/export", authenticate, authorize("ADMIN"), ProductController.export);

/**
 * @swagger
 * /products/barcode/{code}:
 *   get:
 *     summary: Get product by barcode
 *     description: Finds a product by its barcode.
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product found
 *       404:
 *         description: Product not found
 */
productsRouter.get("/barcode/:code", authenticate, authorize("ADMIN", "STAFF"), ProductController.getByBarcode);

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get product by id
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Product detail
 */
productsRouter.get("/:id", authenticate, authorize("ADMIN", "STAFF"), ProductController.getById);

/**
 * @swagger
 * /products/{id}:
 *   patch:
 *     summary: Update product
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Product updated
 */
productsRouter.patch("/:id", authenticate, authorize("ADMIN"), ProductController.update);

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Delete product
 *     tags:
 *       - Products
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       204:
 *         description: Product deleted
 */
productsRouter.delete("/:id", authenticate, authorize("ADMIN"), ProductController.delete);

export default productsRouter;

