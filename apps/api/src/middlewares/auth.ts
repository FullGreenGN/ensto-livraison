import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { can, type Permission, type Role } from "@repo/types";
import { ForbiddenError, UnauthorizedError } from "../lib/errors";

export interface JwtPayload {
  sub: number;
  role: Role;
  iat?: number;
  exp?: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET ?? "changeme_in_production";

// ── authenticate ──────────────────────────────────────────────────────────────

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      next(new UnauthorizedError("No Bearer token provided"));
      return;
    }
    const token = authHeader.slice(7);
    const decoded = jwt.verify(token, JWT_SECRET) as unknown as JwtPayload;
    req.user = decoded;
    next();
  } catch {
    next(new UnauthorizedError("Invalid or expired token"));
  }
}

// ── requireRole ───────────────────────────────────────────────────────────────

/**
 * Checks the role directly (coarse-grained guard).
 * Usage: router.delete("/:id", authenticate, requireRole("Admin"), handler)
 */
export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      next(new ForbiddenError(`Role required: ${roles.join(" | ")}`));
      return;
    }
    next();
  };
}

// ── requirePermission ─────────────────────────────────────────────────────────

/**
 * Checks a fine-grained permission from the ROLE_PERMISSIONS map.
 * Usage: router.post("/", authenticate, requirePermission("livreur:create"), handler)
 */
export function requirePermission(permission: Permission) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user || !can(req.user.role, permission)) {
      next(new ForbiddenError(`Permission required: ${permission}`));
      return;
    }
    next();
  };
}
