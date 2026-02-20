import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { UnauthorizedError } from "../lib/errors";

/**
 * Shape of the decoded JWT payload we expect.
 * Extend this as your token structure evolves.
 */
export interface JwtPayload {
  sub: number;       // Personnel.id
  role: string;      // e.g. "Admin" | "Magasinier"
  iat?: number;
  exp?: number;
}

// Extend Express's Request type so downstream handlers can read `req.user`
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

const JWT_SECRET =  "changeme_in_production";

/**
 * `authenticate` middleware
 *
 * Expects the request to carry a Bearer token in the Authorization header:
 *   Authorization: Bearer <token>
 *
 * On success it attaches the decoded payload to `req.user` and calls next().
 * On failure it forwards an `UnauthorizedError` to the error handler.
 *
 * TODO: Replace the mock secret with a proper key loaded from a secrets
 *       manager (AWS Secrets Manager, Vault, etc.) before going to production.
 */
export function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      next(new UnauthorizedError("No Bearer token provided"));
      return;
    }

    const token = authHeader.slice(7); // strip "Bearer "
    const decoded = jwt.verify(token, JWT_SECRET) as unknown as JwtPayload;
    req.user = decoded;

    next();
  } catch (err) {
    // jwt.verify throws JsonWebTokenError / TokenExpiredError
    next(new UnauthorizedError("Invalid or expired token"));
  }
}

/**
 * `requireRole` middleware factory
 *
 * Usage: router.delete("/:id", authenticate, requireRole("Admin"), handler)
 */
export function requireRole(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      next(new UnauthorizedError(`Role required: ${roles.join(" | ")}`));
      return;
    }
    next();
  };
}

