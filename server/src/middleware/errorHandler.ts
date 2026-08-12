import type { ErrorRequestHandler } from "express";
import mongoose from "mongoose";
import { MulterError } from "multer";
import { ZodError } from "zod";
import { AppError } from "../utils/AppError";

/**
 * Centralized error handler. Route handlers/middleware can simply `throw` (inside
 * an `asyncHandler`-wrapped function) or call `next(err)`, and this converts
 * whatever comes in into a consistent `{ error: string }` JSON body with an
 * appropriate status code.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  if (err instanceof ZodError) {
    const message = err.issues.map((issue) => `${issue.path.join(".") || "body"}: ${issue.message}`).join("; ");
    res.status(400).json({ error: message || "Invalid request body" });
    return;
  }

  if (err instanceof mongoose.Error.ValidationError) {
    res.status(400).json({ error: err.message });
    return;
  }

  if (err instanceof mongoose.Error.CastError) {
    res.status(400).json({ error: `Invalid value for "${err.path}"` });
    return;
  }

  if (err instanceof MulterError) {
    const message = err.code === "LIMIT_FILE_SIZE" ? "File too large (max 5MB)" : err.message;
    res.status(400).json({ error: message });
    return;
  }

  if (typeof err === "object" && err !== null && (err as { code?: number }).code === 11000) {
    res.status(409).json({ error: "A record with this value already exists" });
    return;
  }

  // eslint-disable-next-line no-console
  console.error("[unhandled error]", err);
  res.status(500).json({ error: "Internal server error" });
};
