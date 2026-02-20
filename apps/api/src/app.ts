import cors from "cors";
import express, { Application, Request, Response } from "express";

import { errorHandler } from "./middlewares/errorHandler";
import { requestLogger } from "./middlewares/logger.middleware";
import entrepriseRoutes from "./routes/entreprise.routes";
import livreurRoutes from "./routes/livreur.routes";

export function createApp(): Application {
  const app = express();

  // ── Global middlewares ─────────────────────────────────────────────────────
  app.use(cors());
  app.use(express.json());
  app.use(requestLogger);

  // ── Health-check ───────────────────────────────────────────────────────────
  app.get("/health", (_req: Request, res: Response) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // ── API routes ─────────────────────────────────────────────────────────────
  app.use("/api/entreprises", entrepriseRoutes);
  app.use("/api/livreurs", livreurRoutes);

  // ── 404 catch-all ──────────────────────────────────────────────────────────
  app.use((_req: Request, res: Response) => {
    res.status(404).json({ status: "error", message: "Route not found" });
  });

  // ── Global error handler (must be last) ───────────────────────────────────
  app.use(errorHandler);

  return app;
}
