import type { Request, Response } from "express";
import pool from "../db/pool.js";

type AdminEventRow = {
  id: number;
  session_id: string;
  user_id: string | null;
  product_id: number;
  event_type: string;
  created_at: string;
  sku: string;
  name: string;
};

export async function listEvents(_req: Request, res: Response) {
  const result = await pool.query<AdminEventRow>(
    `SELECT e.id, e.session_id, e.user_id, e.product_id, e.event_type, e.created_at,
            p.sku, p.name
     FROM events e
     JOIN products p ON p.id = e.product_id
     ORDER BY e.created_at DESC
     LIMIT 200`
  );

  const events = result.rows.map((row) => ({
    id: row.id,
    sessionId: row.session_id,
    userId: row.user_id,
    productId: row.product_id,
    eventType: row.event_type,
    createdAt: row.created_at,
    productSku: row.sku,
    productName: row.name,
  }));

  res.json({ events });
}
