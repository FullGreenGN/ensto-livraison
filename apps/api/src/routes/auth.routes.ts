import { Router, IRouter } from "express";
import * as AuthController from "../controllers/auth.controller";
import { authenticate } from "../middlewares/auth";

const router: IRouter = Router();

/** POST /api/auth/login    – Public */
router.post("/login", AuthController.login);

/** POST /api/auth/register – Public */
router.post("/register", AuthController.register);

/** POST /api/auth/change-password – Protected */
router.post("/change-password", authenticate, AuthController.changePassword);

export default router;

