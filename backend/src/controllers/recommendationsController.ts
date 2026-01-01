import type { Request, Response, NextFunction } from "express";
import { pool } from "../db/pool.js";

interface ProductRow {
  id: number;
  sku: string;
  name: string;
  category: string;
  price_cents: number;
  image_url: string | null;
}

function mapProduct(row: ProductRow) {
  return {
    id: row.id,
    sku: row.sku,
    name: row.name,
    category: row.category,
    priceCents: row.price_cents,
    imageUrl: row.image_url,
  };
}

// Enkel regelbaserad motor:
// 1) Hitta senaste events för session → prioritera produkter i dessa kategorier
// 2) Fallback: trending baserat på totalt antal events per produkt
export async function getRecommendations(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const sessionId = (req.query.sessionId as string | undefined) ?? null;

  try {
    let products: ProductRow[] = [];

    if (sessionId) {
      // Hämta senaste events för session + kategorier
      const recentEvents = await pool.query<{
        product_id: number;
        category: string;
      }>(
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
        new Set(recentEvents.rows.map((r: { category: string }) => r.category))
      );

      if (categories.length > 0) {
        const result = await pool.query<ProductRow>(
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

        products = result.rows;
      }
    }

    // Fallback eller påfyllnad: trending
    if (products.length === 0) {
      const trending = await pool.query<ProductRow>(
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
      products = trending.rows;
    }

    const mapped = products.map(mapProduct);
    return res.json(mapped);
  } catch (error) {
    return next(error);
  }
}
