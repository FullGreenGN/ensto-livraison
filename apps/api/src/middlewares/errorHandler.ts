import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../lib/errors";
import { logger } from "../lib/logger";
import { RecordNotFoundError, UniqueConstraintViolationError, DatabaseError } from "@repo/db";

/**
 * All error responses follow the same envelope: { status: "error", message, [details] }
 * This matches the success envelope { status: "success", data } used by controllers.
 */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  next: NextFunction,
): void {
  if (res.headersSent) return next(err);

  // 1. Zod validation errors → 400 with per-field details
  if (err instanceof ZodError) {
    logger.warn(`Validation Error: ${err.message}`);
    res.status(400).json({
      status: "error",
      message: "Validation failed.",
      details: err.errors.map((e) => ({ path: e.path.join("."), message: e.message })),
    });
    return;
  }

  // 2. Known AppError sub-classes (UnauthorizedError, ForbiddenError, ValidationError…)
  if (err instanceof AppError) {
    logger.warn(`[${err.name}] ${err.message}`);
    res.status(err.statusCode).json({ status: "error", message: err.message });
    return;
  }

  // 3. Repository domain errors
  if (err instanceof RecordNotFoundError) {
    logger.warn(`[NotFound] ${err.message}`);
    res.status(404).json({ status: "error", message: err.message });
    return;
  }

  if (err instanceof UniqueConstraintViolationError) {
    logger.warn(`[Conflict] ${err.message}`);
    res.status(409).json({ status: "error", message: err.message });
    return;
  }

  if (err instanceof DatabaseError) {
    logger.error(`[DatabaseError] ${err.message}`, err.originalError);
    res.status(500).json({ status: "error", message: "A database error occurred." });
    return;
  }

  // 4. Unknown / unhandled errors
  logger.error(`[Unhandled] ${(err as Error).message ?? "Unknown error"}`, err);
  res.status(500).json({ status: "error", message: "Internal server error." });
}
