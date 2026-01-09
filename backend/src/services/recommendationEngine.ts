import pool from "../db/pool.js";

export interface RecommendationInput {
  sessionId?: string | null;
  currentProductId?: number | null;
  limit?: number;
}

export interface RecommendedProduct {
  id: number;
  sku: string;
  name: string;
  category: string | null;
  imageUrl: string | null;
}

// Intern typ för raden från databasen
interface ProductRow {
  id: number;
  sku: string;
  name: string;
  category: string | null;
  image_url: string | null;
}

/**
 * Enkel regel:
 * - Hämta “trending” produkter baserat på antal events.
 * - Ingen kolumn `price` används, bara fält som vi vet finns.
 */
export async function getRecommendations(
  input: RecommendationInput
): Promise<RecommendedProduct[]> {
  const limit = input.limit ?? 8;

  const result = await pool.query<ProductRow>(
    `
    SELECT
      p.id,
      p.sku,
      p.name,
      p.category,
      p.image_url
    FROM products p
    LEFT JOIN events e
      ON e.product_id = p.id
    GROUP BY p.id, p.sku, p.name, p.category, p.image_url
    ORDER BY COUNT(e.id) DESC, p.id ASC
    LIMIT $1
    `,
    [limit]
  );

  return result.rows.map((row) => ({
    id: row.id,
    sku: row.sku,
    name: row.name,
    category: row.category ?? null,
    imageUrl: row.image_url ?? null,
  }));
}

export interface RecommendationsDebugResult {
  items: RecommendedProduct[];
  debug: {
    strategy: string;
    sessionId: string | null;
    currentProductId: number | null;
    limit: number;
  };
}

/**
 * Samma som ovan, men med enkel debug-info.
 * Används av admin-preview.
 */
export async function getRecommendationsWithDebug(
  input: RecommendationInput
): Promise<RecommendationsDebugResult> {
  const items = await getRecommendations(input);
  const limit = input.limit ?? 8;

  return {
    items,
    debug: {
      strategy: "trending_only",
      sessionId: input.sessionId ?? null,
      currentProductId: input.currentProductId ?? null,
      limit,
    },
  };
}
