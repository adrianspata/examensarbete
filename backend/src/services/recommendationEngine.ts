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

interface ProductRow {
  id: number;
  sku: string;
  name: string;
  category: string | null;
  image_url: string | null;
}

interface EventRow {
  event_type: string;
  category: string | null;
}

type RecommendationStrategy =
  | "trending_weighted"
  | "category_and_trending_weighted";

interface RecommendationInternalResult {
  items: RecommendedProduct[];
  categoriesUsed: string[];
  strategy: RecommendationStrategy;
}

// Hämta kategori för en specifik produkt
async function fetchProductCategory(
  productId: number
): Promise<string | null> {
  const res = await pool.query<{ category: string | null }>(
    `SELECT category FROM products WHERE id = $1`,
    [productId]
  );

  if (res.rows.length === 0) return null;
  return res.rows[0].category;
}

// Bygg category-scores från sessionens senaste events.
async function fetchSessionCategoryScores(
  sessionId: string
): Promise<Map<string, number>> {
  const res = await pool.query<EventRow>(
    `
    SELECT
      e.event_type,
      p.category
    FROM events e
    JOIN products p
      ON p.id = e.product_id
    WHERE e.session_id = $1
      AND p.category IS NOT NULL
    ORDER BY e.created_at DESC
    LIMIT 20
    `,
    [sessionId]
  );

  const scores = new Map<string, number>();

  res.rows.forEach((row, index) => {
    if (!row.category) return;

    let base = 1; // view
    if (row.event_type === "click") base = 5;
    if (row.event_type === "add_to_cart") base = 8;

    const recencyBonus = Math.max(0, 10 - index); // index 0–19

    const prev = scores.get(row.category) ?? 0;
    scores.set(row.category, prev + base + recencyBonus);
  });

  return scores;
}

async function computeRecommendations(
  input: RecommendationInput
): Promise<RecommendationInternalResult> {
  const limit = input.limit ?? 8;

  let categoriesUsed: string[] = [];

  // 1) Utgå från currentProductId om den finns
  if (input.currentProductId != null) {
    const cat = await fetchProductCategory(input.currentProductId);
    if (cat) {
      categoriesUsed.push(cat);
    }
  }

  // 2) Fyll på med topp-kategorier från sessionens senaste events
  if (input.sessionId) {
    const scores = await fetchSessionCategoryScores(input.sessionId);

    const primaryCategory = categoriesUsed[0] ?? null;

    const extraCategories = Array.from(scores.entries())
      .filter(([cat]) => cat !== primaryCategory)
      .sort((a, b) => b[1] - a[1]) 
      .slice(0, primaryCategory ? 1 : 2) 
      .map(([cat]) => cat);

    categoriesUsed = [...categoriesUsed, ...extraCategories];
  }

  const strategy: RecommendationStrategy =
    categoriesUsed.length > 0
      ? "category_and_trending_weighted"
      : "trending_weighted";

  const categoryArrayParam = categoriesUsed;
  const currentProductId = input.currentProductId ?? null;

  // 3) Hämta produkter med viktning per event-typ + prioritet på categories
  const productsRes = await pool.query(
    `
    SELECT
      p.id,
      p.sku,
      p.name,
      p.category,
      p.image_url,
      COALESCE(
        SUM(
          CASE e.event_type
            WHEN 'add_to_cart' THEN 3
            WHEN 'click'        THEN 2
            WHEN 'view'         THEN 1
            ELSE 0
          END
        ),
        0
      ) AS engagement_score,
      COUNT(e.id) AS event_count,
      CASE
        WHEN $2::text[] IS NOT NULL
             AND array_length($2::text[], 1) > 0
             AND p.category = ANY($2::text[])
        THEN TRUE
        ELSE FALSE
      END AS in_pref_cat
    FROM products p
    LEFT JOIN events e
      ON e.product_id = p.id
    WHERE ($3::int IS NULL OR p.id <> $3::int)  -- exkludera currentProductId
    GROUP BY p.id, p.sku, p.name, p.category, p.image_url
    ORDER BY
      in_pref_cat DESC,          -- först produkter i "preferred categories"
      engagement_score DESC,     -- sedan mest engagerande (med viktade events)
      event_count DESC,          -- sedan antal events som tiebreaker
      p.id ASC                   -- stabil sortering
    LIMIT $1
    `,
    [limit, categoryArrayParam, currentProductId]
  );

  const items: RecommendedProduct[] = (productsRes.rows as ProductRow[]).map(
    (row) => ({
      id: row.id,
      sku: row.sku,
      name: row.name,
      category: row.category ?? null,
      imageUrl: row.image_url ?? null,
    })
  );

  return { items, categoriesUsed, strategy };
}

export async function getRecommendations(
  input: RecommendationInput
): Promise<RecommendedProduct[]> {
  const { items } = await computeRecommendations(input);
  return items;
}

export interface RecommendationsDebugResult {
  items: RecommendedProduct[];
  debug: {
    strategy: RecommendationStrategy;
    sessionId: string | null;
    currentProductId: number | null;
    limit: number;
    categoriesUsed: string[];
  };
}

export async function getRecommendationsWithDebug(
  input: RecommendationInput
): Promise<RecommendationsDebugResult> {
  const { items, categoriesUsed, strategy } = await computeRecommendations(
    input
  );
  const limit = input.limit ?? 8;

  return {
    items,
    debug: {
      strategy,
      sessionId: input.sessionId ?? null,
      currentProductId: input.currentProductId ?? null,
      limit,
      categoriesUsed,
    },
  };
}
