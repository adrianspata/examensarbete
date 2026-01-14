import type { Request, Response, NextFunction } from "express";
import { createEvent } from "../models/eventModel.js";
import { validateEventPayload } from "../utils/validate.js";

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
    next(err);
  }
}
