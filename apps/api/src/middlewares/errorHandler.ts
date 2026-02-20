import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../lib/errors";
import { logger } from "../lib/logger";

/**
 * Global error-handling middleware.
 *
 * Must be registered LAST in `app.ts` (after all routes) with four
 * parameters so Express recognises it as an error handler.
 *
 * Handles:
 *  - Our own `AppError` sub-classes  → use their built-in statusCode
 *  - Zod `ZodError`                  → 400 with field-level details
 *  - Everything else                 → 500 Internal Server Error
 */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction,
): void {
  // --- Zod validation errors ---
  if (err instanceof ZodError) {
    res.status(400).json({
      status: "error",
      message: "Validation failed",
      errors: err.flatten().fieldErrors,
    });
    return;
  }

  // --- Our own application errors (NotFoundError, ValidationError, …) ---
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: "error",
      message: err.message,
    });
    return;
  }

  // --- Unexpected / unhandled errors ---
  logger.error("[Unhandled Error]", err);
  res.status(500).json({
    status: "error",
    message: "Internal server error",
  });
}
