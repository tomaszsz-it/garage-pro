export class DatabaseError extends Error {
  constructor(
    message: string,
    public readonly details?: unknown,
    public readonly code?: string
  ) {
    super(message);
    this.name = "DatabaseError";
  }
}
