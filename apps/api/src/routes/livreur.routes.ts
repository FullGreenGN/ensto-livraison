import { Router, IRouter } from "express";
import * as LivreurController from "../controllers/livreur.controller";
import { authenticate, requireRole } from "../middlewares/auth";

const router: IRouter = Router();

// GET /api/livreurs          (+ optional ?entrepriseId=)
router.get("/", authenticate, LivreurController.getAll);

// GET /api/livreurs/:id
router.get("/:id", authenticate, LivreurController.getOne);

// POST /api/livreurs
router.post("/", LivreurController.create);

// PATCH /api/livreurs/:id
router.patch("/:id", authenticate, requireRole("Admin", "Magasinier"), LivreurController.update);

// DELETE /api/livreurs/:id
router.delete("/:id", authenticate, requireRole("Admin"), LivreurController.remove);

export default router;

