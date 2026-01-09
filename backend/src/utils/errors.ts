import type { NextFunction, Request, Response } from "express";

export class AppError extends Error {
  statusCode: number;
  details?: unknown;

  constructor(message: string, statusCode = 400, details?: unknown) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.details = details;
  }
}

export function isAppError(err: unknown): err is AppError {
  return err instanceof AppError;
}

/**
 * Helper för att skapa 400-fel (t.ex. valideringsfel).
 */
export function badRequest(message: string, details?: unknown): AppError {
  return new AppError(message, 400, details);
}

/**
 * Helper för att skapa 404-fel.
 */
export function notFound(message = "Not found", details?: unknown): AppError {
  return new AppError(message, 404, details);
}

/**
 * Central error middleware för Express.
 * Ska registreras sist i app.ts med: app.use(errorMiddleware);
 */
export function errorMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (isAppError(err)) {
    const body: Record<string, unknown> = {
      ok: false,
      error: err.message,
    };
    if (err.details) {
      body.details = err.details;
    }
    return res.status(err.statusCode).json(body);
  }

  console.error("Unexpected error:", err);

  return res.status(500).json({
    ok: false,
    error: "Internal server error",
  });
}
