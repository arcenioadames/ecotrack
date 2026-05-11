import { Router } from "express";
import AuthController from "../controllers/auth.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";

export const authRouter = Router();

authRouter.post("/register", AuthController.register);
authRouter.post("/login", AuthController.login);
authRouter.post("/refresh", AuthController.refresh);

authRouter.post(
  "/register-admin",
  authenticate,
  authorize("ADMIN"),
  AuthController.registerAdminPlaceholder,
);

export default authRouter;