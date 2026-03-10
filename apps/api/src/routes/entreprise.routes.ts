import { Router, IRouter } from "express";
import * as EntrepriseController from "../controllers/entreprise.controller";
import { authenticate, requirePermission } from "../middlewares/auth";

const router: IRouter = Router();

/**
 * Public reads – require a valid JWT.
 * Destructive operations additionally require the "Admin" role.
 */

// GET /api/entreprises
router.get("/", authenticate, requirePermission("entreprise:read"), EntrepriseController.getAll);

// GET /api/entreprises/:id
router.get("/:id", authenticate, requirePermission("entreprise:read"), EntrepriseController.getOne);

// POST /api/entreprises
router.post("/", authenticate, requirePermission("entreprise:create"), EntrepriseController.create);

// PATCH /api/entreprises/:id
router.patch("/:id", authenticate, requirePermission("entreprise:update"), EntrepriseController.update);

// DELETE /api/entreprises/:id
router.delete("/:id", authenticate, requirePermission("entreprise:delete"), EntrepriseController.remove);

export default router;
