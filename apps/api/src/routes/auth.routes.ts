import { Router, IRouter } from "express";
import * as AuthController from "../controllers/auth.controller";

const router: IRouter = Router();

/** POST /api/auth/login    – Public */
router.post("/login", AuthController.login);

/** POST /api/auth/register – Public */
router.post("/register", AuthController.register);

export default router;

