import type { NextFunction, Request, RequestHandler, Response } from "express";

/**
 * Wraps an async Express route/middleware handler so that any rejected promise
 * (thrown error inside an `async` function) is forwarded to `next(err)` instead
 * of crashing the process. Express 4 does not do this automatically (Express 5 does).
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
): RequestHandler {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}
