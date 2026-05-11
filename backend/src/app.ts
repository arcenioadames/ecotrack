/// <reference path="./types/express.d.ts" />
import express from "express";
import cors, { type CorsOptions } from "cors";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";

import authRouter from "./routes/auth.routes";
import { swaggerSpec } from "./config/swagger";

import { registerTestingRoutes } from "./routes/testing.routes";

export const app = express();

// Testing-only routes: solo en entorno de test y salvo bandera explícita de desactivación
if (process.env.NODE_ENV === "test" && process.env.DISABLE_TEST_ROUTES !== "1") {
  registerTestingRoutes(app);
}

function corsOptions(): CorsOptions {
  const raw = process.env.CORS_ORIGIN?.trim();
  if (!raw) {
    return {};
  }
  const list = raw.split(",").map((o) => o.trim()).filter(Boolean);
  if (list.length === 0) {
    return {};
  }
  return { origin: list.length === 1 ? list[0] : list };
}

// Middleware
app.use(cors(corsOptions()));
app.use(helmet());
// Morgan: no en producción ni en tests; en local suele faltar NODE_ENV → se considera dev
if (process.env.NODE_ENV !== "production" && process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}
app.use(express.json());

// Swagger documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Root route: redirect to API docs
app.get("/", (_req, res) => {
  res.redirect("/api-docs");
});

// Routes
app.use("/auth", authRouter);

// Health check
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});




export default app;

