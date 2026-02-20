export class DatabaseError extends Error {
  constructor(message: string, public originalError?: unknown) {
    super(message);
    this.name = 'DatabaseError';
  }
}

export class RecordNotFoundError extends DatabaseError {
  constructor(entity: string, id: string | number) {
    super(`${entity} with ID ${id} not found.`);
    this.name = 'RecordNotFoundError';
  }
}

export class UniqueConstraintViolationError extends DatabaseError {
  constructor(field: string) {
    super(`Unique constraint violation on field: ${field}`);
    this.name = 'UniqueConstraintViolationError';
  }
}

