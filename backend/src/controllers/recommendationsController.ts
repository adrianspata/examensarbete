import type { Request, Response } from "express";
import pool from "../db/pool.js";

type RecentRow = { category: string };
type ProductRow = {
  id: number;
  sku: string;
  name: string;
  category: string;
  price_cents: number;
  image_url: string;
};

export async function getRecommendations(req: Request, res: Response) {
  const sessionId = typeof req.query.sessionId === "string" ? req.query.sessionId : "";
  if (!sessionId) return res.status(400).json({ error: "sessionId is required" });

  // Dag 5: transparent, enkel baseline.
  // 1) ta senaste kategorier (om finns)
  const recent = await pool.query<RecentRow>(
    `SELECT p.category
     FROM events e
     JOIN products p ON p.id = e.product_id
     WHERE e.session_id = $1
     ORDER BY e.created_at DESC
     LIMIT 8`,
    [sessionId]
  );

  const categories = Array.from(new Set(recent.rows.map((r: RecentRow) => r.category)));

  let productsResult;
  if (categories.length > 0) {
    productsResult = await pool.query<ProductRow>(
      `SELECT id, sku, name, category, price_cents, image_url
       FROM products
       WHERE category = ANY($1::text[])
       ORDER BY id DESC
       LIMIT 6`,
      [categories]
    );
  } else {
    // fallback: top 6 senaste produkter (trending kommer dag 6)
    productsResult = await pool.query<ProductRow>(
      `SELECT id, sku, name, category, price_cents, image_url
       FROM products
       ORDER BY id DESC
       LIMIT 6`
    );
  }

  const recommendations = productsResult.rows.map((p) => ({
    id: p.id,
    sku: p.sku,
    name: p.name,
    category: p.category,
    priceCents: p.price_cents,
    imageUrl: p.image_url,
  }));

  res.json({ recommendations });
}
