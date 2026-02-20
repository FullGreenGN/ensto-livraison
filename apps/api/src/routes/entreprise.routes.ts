import { Router, IRouter } from "express";
import * as EntrepriseController from "../controllers/entreprise.controller";
import { authenticate, requireRole } from "../middlewares/auth";

const router: IRouter = Router();

/**
 * Public reads – require a valid JWT.
 * Destructive operations additionally require the "Admin" role.
 */

// GET /api/entreprises
router.get("/", EntrepriseController.getAll);

// GET /api/entreprises/:id
router.get("/:id", authenticate, EntrepriseController.getOne);

// POST /api/entreprises
router.post("/", EntrepriseController.create);

// PATCH /api/entreprises/:id
router.patch("/:id", authenticate, requireRole("Admin"), EntrepriseController.update);

// DELETE /api/entreprises/:id
router.delete("/:id", authenticate, requireRole("Admin"), EntrepriseController.remove);

export default router;

