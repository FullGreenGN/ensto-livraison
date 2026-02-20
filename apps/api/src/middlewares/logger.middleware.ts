import { Request, Response, NextFunction } from "express";
import { logger } from "../lib/logger";

/**
 * Middleware that logs each incoming request.
 */
export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const start = Date.now();
  const { method, url } = req;

  // Log immediately on receipt
  logger.info(`Incoming Request: ${method} ${url}`);

  // Hook into response finish to log completion time and status code
  res.on("finish", () => {
    const duration = Date.now() - start;
    const { statusCode } = res;
    logger.info(
      `Request Completed: ${method} ${url} ${statusCode} - ${duration}ms`,
    );
  });

  next();
}

