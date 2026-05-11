import type { Express } from "express";

import { authenticate, authorize } from "../middlewares/auth.middleware";

export function registerTestingRoutes(app: Express): void {
  // Endpoints SOLO para test de middlewares (HTTP real via Supertest)
  // Hardening: deben registrarse SOLO cuando NODE_ENV==='test'
  app.get("/protected/authenticate", authenticate, (_req, res) => {
    res.status(200).json({ ok: true });
  });

  app.get("/protected/rbac", authenticate, authorize("ADMIN"), (_req, res) => {
    res.status(200).json({ ok: true });
  });
}

