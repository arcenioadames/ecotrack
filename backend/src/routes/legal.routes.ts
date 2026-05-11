import { Router } from "express";

import LegalController from "../controllers/legal.controller";

export const legalRouter = Router();

/**
 * @swagger
 * /legal/privacy:
 *   get:
 *     summary: Get privacy policy page
 *     description: Visible legal page with the data treatment policy and compliance summary.
 *     tags:
 *       - Legal
 *     responses:
 *       200:
 *         description: HTML privacy policy page
 *         content:
 *           text/html:
 *             schema:
 *               type: string
 */
legalRouter.get("/privacy", LegalController.getPrivacyPolicy);

export default legalRouter;