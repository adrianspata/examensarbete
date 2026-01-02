import type { Request, Response } from "express";
import pool from "../db/pool.js";

type CreateEventBody = {
  sessionId?: string;
  userId?: string | null;
  productId?: number;
  eventType?: string;
};

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

function isPositiveInt(v: unknown): v is number {
  return typeof v === "number" && Number.isInteger(v) && v > 0;
}

export async function collectEvent(req: Request, res: Response) {
  const body = req.body as CreateEventBody;

  if (!isNonEmptyString(body.sessionId)) {
    return res.status(400).json({ error: "sessionId is required" });
  }
  if (!isPositiveInt(body.productId)) {
    return res.status(400).json({ error: "productId must be a positive integer" });
  }
  if (!isNonEmptyString(body.eventType)) {
    return res.status(400).json({ error: "eventType is required" });
  }

  const userId = body.userId ?? null;

  await pool.query(
    `INSERT INTO events (session_id, user_id, product_id, event_type)
     VALUES ($1, $2, $3, $4)`,
    [body.sessionId.trim(), userId, body.productId, body.eventType.trim()]
  );

  res.status(201).json({ ok: true });
}
