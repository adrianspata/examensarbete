import type { Request, Response, NextFunction } from "express";
import { createEvent } from "../models/eventModel.js";
import { validateEventPayload } from "../utils/validate.js";

/**
 * POST /events
 * Tar emot ett event (view/click/add_to_cart), validerar payload
 * och skriver till databasen.
 */
export async function createEventHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const payload = validateEventPayload(req.body);

    await createEvent({
      sessionId: payload.sessionId,
      productId: payload.productId,
      eventType: payload.eventType,
      userId: payload.userId,
      metadata: payload.metadata,
    });

    res.status(201).json({ ok: true });
  } catch (err) {
    // Låt central error-middleware hantera AppError / oväntade fel
    next(err);
  }
}
