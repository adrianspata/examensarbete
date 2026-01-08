// backend/src/models/eventModel.ts
import pool from "../db/pool.js";

export type EventType = "view" | "click" | "add_to_cart";

export interface Event {
  id: number;
  sessionId: string;
  userId: string | null;
  productId: number;
  eventType: EventType;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
}

export const EVENT_TABLE = "events";

export const createEventsTableSQL = `
CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  session_id TEXT NOT NULL,
  user_id TEXT,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
`;

// ---- NYTT: input-typ + helper + createEvent ----

export interface CreateEventParams {
  sessionId: string;
  userId?: string | null;
  productId: number;
  eventType: EventType;
  metadata?: Record<string, unknown> | null;
}

function mapRowToEvent(row: any): Event {
  return {
    id: row.id,
    sessionId: row.session_id,
    userId: row.user_id ?? null,
    productId: row.product_id,
    eventType: row.event_type as EventType,
    metadata: row.metadata ?? null,
    createdAt: row.created_at instanceof Date
      ? row.created_at
      : new Date(row.created_at),
  };
}

/**
 * Skapar ett event i databasen och returnerar den skapade Event-objektet.
 */
export async function createEvent(params: CreateEventParams): Promise<Event> {
  const {
    sessionId,
    userId = null,
    productId,
    eventType,
    metadata = null,
  } = params;

  const result = await pool.query(
    `
    INSERT INTO ${EVENT_TABLE} (session_id, user_id, product_id, event_type, metadata)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING
      id,
      session_id,
      user_id,
      product_id,
      event_type,
      metadata,
      created_at;
    `,
    [sessionId, userId, productId, eventType, metadata]
  );

  return mapRowToEvent(result.rows[0]);
}
