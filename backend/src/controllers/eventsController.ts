import type { Request, Response, NextFunction } from "express";
import { pool } from "../db/pool.js";

type EventType = "view" | "click" | "add_to_cart";

interface EventBody {
  sessionId: string;
  userId?: string;
  productId: number;
  type: EventType;
}

export async function collectEvent(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { sessionId, userId, productId, type } = req.body as Partial<EventBody>;

  if (!sessionId || typeof sessionId !== "string") {
    return res.status(400).json({ error: "sessionId is required" });
  }

  if (!productId || typeof productId !== "number") {
    return res.status(400).json({ error: "productId (number) is required" });
  }

  if (!type || !["view", "click", "add_to_cart"].includes(type)) {
    return res.status(400).json({ error: "type must be view|click|add_to_cart" });
  }

  try {
    await pool.query("BEGIN");

    // Upsert session
    await pool.query(
      `
      INSERT INTO sessions (session_id, user_id)
      VALUES ($1, $2)
      ON CONFLICT (session_id)
      DO UPDATE SET user_id = COALESCE(EXCLUDED.user_id, sessions.user_id);
    `,
      [sessionId, userId ?? null]
    );

    // Insert event
    await pool.query(
      `
      INSERT INTO events (session_id, user_id, product_id, event_type)
      VALUES ($1, $2, $3, $4);
    `,
      [sessionId, userId ?? null, productId, type]
    );

    await pool.query("COMMIT");

    return res.status(201).json({ ok: true });
  } catch (error) {
    try {
      await pool.query("ROLLBACK");
    } catch {
      // ignore rollback errors
    }
    return next(error);
  }
}
