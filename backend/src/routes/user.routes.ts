import { Router } from "express";

import UserController from "../controllers/user.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";

export const userRouter = Router();

/**
 * HU-15 - Gestión de usuarios (mínima backend).
 * - Cambiar estado isActive (ADMIN only)
 * - Cambiar contraseña requiriendo contraseña actual (ADMIN only, para su propio usuario)
 */
userRouter.patch("/:id/active", authenticate, authorize("ADMIN"), UserController.setActive);
userRouter.post(
  "/:id/password",
  authenticate,
  authorize("ADMIN"),
  UserController.changePassword,
);

export default userRouter;

