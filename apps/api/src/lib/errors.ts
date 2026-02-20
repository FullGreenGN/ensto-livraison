/**
 * Custom application error hierarchy.
 *
 * Throwing these from services lets controllers (and the global error
 * middleware) map them to the correct HTTP status codes without any
 * isinstance-checking boilerplate spread across every handler.
 */

export class AppError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number = 500,
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/** 404 – resource does not exist */
export class NotFoundError extends AppError {
  constructor(resource: string, id: number | string) {
    super(`${resource} with id ${id} not found.`, 404);
  }
}

/** 400 – caller supplied invalid data */
export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

/** 401 – missing / invalid credentials */
export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401);
  }
}

/** 403 – authenticated but not allowed */
export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(message, 403);
  }
}

