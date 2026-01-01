import type { Request, Response, NextFunction } from "express";
import { pool } from "../db/pool.js";

interface EventRow {
  id: number;
  session_id: string;
  user_id: string | null;
  product_id: number;
  event_type: string;
  created_at: string;
  sku: string;
  name: string;
}

export async function getEvents(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await pool.query<EventRow>(
      `
      SELECT
        e.id,
        e.session_id,
        e.user_id,
        e.product_id,
        e.event_type,
        e.created_at,
        p.sku,
        p.name
      FROM events e
      JOIN products p ON p.id = e.product_id
      ORDER BY e.created_at DESC
      LIMIT 50;
    `
    );

    const events = result.rows.map((row: EventRow) => ({
      id: row.id,
      sessionId: row.session_id,
      userId: row.user_id,
      productId: row.product_id,
      eventType: row.event_type,
      createdAt: row.created_at,
      productSku: row.sku,
      productName: row.name,
    }));

    return res.json(events);
  } catch (error) {
    return next(error);
  }
}

// Enkel preview-endpoint för admin – återanvänder samma logik som /recommendations,
// men håller implementationen här tills vi ev. extraherar en gemensam service.
export async function getRecommendationsPreview(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const sessionId = (req.query.sessionId as string | undefined) ?? null;

  try {
    let productsResult = await pool.query(
      `
      SELECT
        p.id,
        p.sku,
        p.name,
        p.category,
        p.price_cents,
        p.image_url
      FROM products p
      LEFT JOIN events e ON e.product_id = p.id
      GROUP BY p.id
      ORDER BY COUNT(e.id) DESC, p.id ASC
      LIMIT 12;
    `
    );

    if (sessionId) {
      const recentEvents = await pool.query(
        `
        SELECT e.product_id, p.category
        FROM events e
        JOIN products p ON p.id = e.product_id
        WHERE e.session_id = $1
        ORDER BY e.created_at DESC
        LIMIT 20;
      `,
        [sessionId]
      );

      const categories = Array.from(
        new Set(recentEvents.rows.map((r: any) => r.category))
      );

      if (categories.length > 0) {
        productsResult = await pool.query(
          `
          SELECT
            id,
            sku,
            name,
            category,
            price_cents,
            image_url
          FROM products
          WHERE category = ANY($1::text[])
          ORDER BY id ASC
          LIMIT 12;
        `,
          [categories]
        );
      }
    }

    const products = productsResult.rows.map((row: any) => ({
      id: row.id,
      sku: row.sku,
      name: row.name,
      category: row.category,
      priceCents: row.price_cents,
      imageUrl: row.image_url,
    }));

    return res.json({
      sessionId,
      count: products.length,
      products,
    });
  } catch (error) {
    return next(error);
  }
}
