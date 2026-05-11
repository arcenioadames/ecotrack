import { Router } from "express";

import PrivacyController from "../controllers/privacy.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";
import { basicApiProtection } from "../middlewares/security.middleware";

export const privacyRouter = Router();

/**
 * @swagger
 * /privacy/me:
 *   delete:
 *     summary: Anonymize authenticated user
 *     description: Implements the right to be forgotten by anonymizing the authenticated user while preserving legal audit trails.
 *     tags:
 *       - Privacy
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AnonymizeMeRequest'
 *     responses:
 *       200:
 *         description: User anonymized successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AnonymizeMeResponse'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: User already anonymized
 */
privacyRouter.delete("/me", authenticate, basicApiProtection, PrivacyController.anonymizeMe);

/**
 * @swagger
 * /privacy/audits/policy:
 *   get:
 *     summary: List policy acceptance audits
 *     description: ADMIN-only audit listing with pagination and filters.
 *     tags:
 *       - Privacy
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Policy audits list
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
privacyRouter.get("/audits/policy", authenticate, authorize("ADMIN"), PrivacyController.listPolicyAudits);

/**
 * @swagger
 * /privacy/audits/anonymization:
 *   get:
 *     summary: List anonymization audits
 *     description: ADMIN-only audit listing with pagination and filters.
 *     tags:
 *       - Privacy
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Anonymization audits list
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */
privacyRouter.get("/audits/anonymization", authenticate, authorize("ADMIN"), PrivacyController.listAnonymizationAudits);

export default privacyRouter;