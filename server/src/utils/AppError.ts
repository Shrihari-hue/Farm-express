/**
 * Generic HTTP error carrying an explicit status code. Route handlers/middleware
 * can `throw new AppError(404, "Worker not found")` and the centralized error
 * handler (see middleware/errorHandler.ts) will turn it into a consistent
 * `{ error: string }` JSON response with the right status code.
 */
export class AppError extends Error {
  public readonly statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.name = "AppError";
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
