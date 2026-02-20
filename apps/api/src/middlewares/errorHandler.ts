import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../lib/errors";
import { logger } from "../lib/logger";
import { RecordNotFoundError, UniqueConstraintViolationError, DatabaseError } from "@repo/db";

/**
 * Global error-handling middleware.
 *
 * Must be registered LAST in `app.ts` (after all routes) with four
 * parameters so Express recognises it as an error handler.
 *
 * Handles:
 *  - Our own `AppError` sub-classes  → use their built-in statusCode
 *  - Zod `ZodError`                  → 400 with field-level details
 *  - Repository Errors               → 404, 409, 500
 *  - Everything else                 → 500 Internal Server Error
 */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  next: NextFunction, // express requires 4 params
): void {
  // If headers are already sent, delegate to default Express handler
  if (res.headersSent) {
    return next(err);
  }

  // 1. Zod Validation Errors
  if (err instanceof ZodError) {
    logger.warn(`Validation Error: ${err.message}`);
    res.status(400).json({
      error: "Validation Error",
      details: err.errors,
    });
    return;
  }

  // 2. Known App Errors
  if (err instanceof AppError) {
    logger.warn(`App Error: ${err.message}`, { code: err.statusCode });
    res.status(err.statusCode).json({
      error: err.name,
      message: err.message,
    });
    return;
  }

  // 3. Database Errors (from @repo/db)
  if (err instanceof RecordNotFoundError) {
    logger.warn(`Not Found: ${err.message}`);
    res.status(404).json({
      error: "Not Found",
      message: err.message,
    });
    return;
  }

  if (err instanceof UniqueConstraintViolationError) {
    logger.warn(`Conflict: ${err.message}`);
    res.status(409).json({
      error: "Conflict",
      message: err.message,
    });
    return;
  }

  if (err instanceof DatabaseError) {
    logger.error(`Database Error: ${err.message}`, err.originalError);
    res.status(500).json({
      error: "Database Error",
      message: "An error occurred while accessing the database.",
    });
    return;
  }

  // 4. Unknown Errors
  // Log the full error stack for debugging
  logger.error(`Unhandled Error: ${(err as Error).message}`, err);

  res.status(500).json({
    error: "Internal Server Error",
    message: "Something went wrong.",
  });
}
