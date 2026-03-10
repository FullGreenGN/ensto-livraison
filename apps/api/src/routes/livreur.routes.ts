import { Router, IRouter } from "express";
import * as LivreurController from "../controllers/livreur.controller";
import { authenticate, requirePermission } from "../middlewares/auth";

const router: IRouter = Router();

// GET /api/livreurs          (+ optional ?entrepriseId=)
router.get("/", authenticate, requirePermission("livreur:read"), LivreurController.getAll);

// GET /api/livreurs/:id
router.get("/:id", authenticate, requirePermission("livreur:read"), LivreurController.getOne);

// POST /api/livreurs
router.post("/", authenticate, requirePermission("livreur:create"), LivreurController.create);

// PATCH /api/livreurs/:id
router.patch("/:id", authenticate, requirePermission("livreur:update"), LivreurController.update);

// DELETE /api/livreurs/:id
router.delete("/:id", authenticate, requirePermission("livreur:delete"), LivreurController.remove);

export default router;
