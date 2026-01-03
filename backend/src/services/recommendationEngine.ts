import pool from "../db/pool.js";

export type EventType = "view" | "click" | "add_to_cart";

export interface RecommendationInput {
  sessionId?: string;
  currentProductId?: number;
  limit?: number;
}

export interface Product {
  id: number;
  sku: string;
  name: string;
  category: string | null;
  price: number | null;
  image_url: string | null;
  created_at: Date;
}

/**
 * Enkel regelbaserad motor:
 *
 * 1) Titta på senaste events för sessionen (view/click/add_to_cart)
 *    → extrahera kategorier
 *    → rekommendera produkter i dessa kategorier (exkludera currentProductId)
 * 2) Om för få träffar → fyll på med "trending" produkter
 *    baserat på antal events senaste 30 dagarna
 * 3) Fallback: om ingen session/kategorier → enbart trending
 */
export async function getRecommendations(
  input: RecommendationInput
): Promise<Product[]> {
  const { sessionId, currentProductId, limit = 8 } = input;

  const collected: Product[] = [];
  const seenProductIds = new Set<number>();

  if (currentProductId) {
    seenProductIds.add(currentProductId);
  }

  // 1) Session-baserade kategorier (om session finns)
  if (sessionId) {
    const { rows: recentEvents } = await pool.query<{
      product_id: number;
      category: string | null;
    }>(
      `
      SELECT e.product_id, p.category
      FROM events e
      JOIN products p ON p.id = e.product_id
      WHERE e.session_id = $1
      ORDER BY e.created_at DESC
      LIMIT 30
      `,
      [sessionId]
    );

    const categories = Array.from(
      new Set(recentEvents.map((row) => row.category).filter(Boolean))
    ) as string[];

    // markera redan berörda produkter som "sedda"
    for (const row of recentEvents) {
      seenProductIds.add(row.product_id);
    }

    if (categories.length > 0) {
      const { rows: categoryProducts } = await pool.query<Product>(
        `
        SELECT p.*
        FROM products p
        WHERE p.category = ANY($1)
        AND p.id <> COALESCE($2, -1)
        LIMIT $3
        `,
        [categories, currentProductId ?? null, limit]
      );

      for (const p of categoryProducts) {
        if (!seenProductIds.has(p.id)) {
          collected.push(p);
          seenProductIds.add(p.id);
          if (collected.length >= limit) {
            return collected;
          }
        }
      }
    }
  }

  // 2) Trending (fallback eller påfyllnad)
  const remaining = limit - collected.length;
  if (remaining > 0) {
    const { rows: trending } = await pool.query<Product>(
      `
      SELECT p.*
      FROM events e
      JOIN products p ON p.id = e.product_id
      WHERE e.created_at >= NOW() - INTERVAL '30 days'
      GROUP BY p.id
      ORDER BY COUNT(*) DESC
      LIMIT $1
      `,
      [limit * 2] // lite extra för att kunna filtrera bort redan sedda
    );

    for (const p of trending) {
      if (!seenProductIds.has(p.id)) {
        collected.push(p);
        seenProductIds.add(p.id);
        if (collected.length >= limit) {
          break;
        }
      }
    }
  }

  // 3) Absolut fallback om det fortfarande är tomt: ta bara några produkter
  if (collected.length === 0) {
    const { rows: fallbackProducts } = await pool.query<Product>(
      `
      SELECT *
      FROM products
      ORDER BY created_at DESC
      LIMIT $1
      `,
      [limit]
    );
    return fallbackProducts;
  }

  return collected;
}
