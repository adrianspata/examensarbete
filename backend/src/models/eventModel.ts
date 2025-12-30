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
