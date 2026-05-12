import { Router } from "express";

import AnalyticsController from "../controllers/analytics.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";

export const analyticsRouter = Router();

/**
 * @swagger
 * /analytics/dashboard:
 *   get:
 *     summary: Inventory dashboard analytics
 *     description: Returns dashboard metrics for inventory health.
 *     tags:
 *       - Analytics
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard metrics
 */
analyticsRouter.get("/dashboard", authenticate, authorize("ADMIN"), AnalyticsController.getDashboard);

export default analyticsRouter;
