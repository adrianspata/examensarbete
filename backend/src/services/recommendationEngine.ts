import pool from "../db/pool.js";

/**
 * Recommendation engine – current behaviour (v1)
 *
 * - Uses recent events for a given session (and/​or currentProductId)
 *   to infer one or more “interest categories”.
 * - Picks products from those categories when möjligt.
 * - Falls back to a simple “trending” list (flest events) så att
 *   det alltid finns något att visa.
 *
 * Designmål för examensarbetet:
 * - Enkel att följa i kod.
 * - Transparens via admin-debug (man kan se strategy + categoriesUsed).
 *
 * TODO – möjliga förbättringar:
 * - Viktning av kategorier utifrån recency och frequency.
 * - Begränsa analysen till ett tidsfönster (t.ex. senaste 7 dagarna).
 * - Ta hänsyn till typ av event (view/click/add_to_cart) med olika vikt.
 * - Undvika att rekommendera exakt samma produkt för ofta i rad.
 */

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

type RecommendationStrategy = "trending_only" | "category_and_trending";

interface RecommendationInternalResult {
  items: RecommendedProduct[];
  categoriesUsed: string[];
  strategy: RecommendationStrategy;
}

/**
 * Hämta kategori för en specifik produkt (t.ex. currentProductId).
 */
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

/**
 * Bygg category-scores från sessionens senaste events.
 * - Vi tittar bara på de SENASTE 20 events.
 * - Klick väger mer än view, add_to_cart väger mest.
 */
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

    // Basvikt per eventtyp
    let base = 1; // view
    if (row.event_type === "click") base = 5;
    if (row.event_type === "add_to_cart") base = 8;

    // Enkel recency – de allra senaste får en liten bonus
    const recencyBonus = Math.max(0, 10 - index); // index 0–19

    const prev = scores.get(row.category) ?? 0;
    scores.set(row.category, prev + base + recencyBonus);
  });

  return scores;
}

/**
 * Huvudlogik för att ta fram rekommendationer.
 */
async function computeRecommendations(
  input: RecommendationInput
): Promise<RecommendationInternalResult> {
  const limit = input.limit ?? 8;

  let categoriesUsed: string[] = [];
  let strategy: RecommendationStrategy = "trending_only";

  // 1) Utgå från currentProductId om den finns
  if (input.currentProductId != null) {
    const cat = await fetchProductCategory(input.currentProductId);
    if (cat) {
      categoriesUsed.push(cat);
    }
  }

  // Heuristic för kategori-intresse:
// - Räknar hur ofta varje kategori förekommer i event-historiken.
// - Sorterar på count, tar de N vanligaste (t.ex. 2–3 st).
//
// Begränsningar i v1:
// - Ingen tidsviktning (ett klick för 30 dagar sedan väger lika tungt
//   som ett klick nyss).
// - Ingen skillnad mellan view/click/add_to_cart.
//
// TODO (framtida förbättring):
// - Ge olika poäng per event-typ (add_to_cart > click > view).
// - Låt nyare events väga tyngre än äldre.
// - Lägg in minsta tröskel (t.ex. kräver minst X events innan
//   kategorin räknas som “aktivt intresse”).


  // 2) Fyll på med topp-kategorier från sessionens senaste events (om vi har sessionId)
  if (input.sessionId) {
    const scores = await fetchSessionCategoryScores(input.sessionId);

    // om vi redan har en kategori från currentProductId – exkludera den från topp-listan
    const primaryCategory = categoriesUsed[0] ?? null;

    const extraCategories = Array.from(scores.entries())
      .filter(([cat]) => cat !== primaryCategory)
      .sort((a, b) => b[1] - a[1]) // högst score först
      .slice(0, primaryCategory ? 1 : 2) // max totalt 2 kategorier
      .map(([cat]) => cat);

    categoriesUsed = [...categoriesUsed, ...extraCategories];
  }

  if (categoriesUsed.length > 0) {
    strategy = "category_and_trending";
  }

  // 3) Hämta produkter inom valda kategorier, eller global trending som fallback
  let productsRes;
  if (categoriesUsed.length > 0) {
    productsRes = await pool.query<ProductRow>(
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
      WHERE p.category = ANY($1::text[])
      GROUP BY p.id, p.sku, p.name, p.category, p.image_url
      ORDER BY COUNT(e.id) DESC, p.id ASC
      LIMIT $2
      `,
      [categoriesUsed, limit + 1] // +1 för att kunna filtrera bort currentProductId
    );
  } else {
    productsRes = await pool.query<ProductRow>(
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
      [limit + 1]
    );
  }

  let items: RecommendedProduct[] = productsRes.rows.map((row) => ({
    id: row.id,
    sku: row.sku,
    name: row.name,
    category: row.category ?? null,
    imageUrl: row.image_url ?? null,
  }));

  // 4) Exkludera ev. currentProductId
  if (input.currentProductId != null) {
    items = items.filter((p) => p.id !== input.currentProductId);
  }

  // 5) Trunka till limit
  if (items.length > limit) {
    items = items.slice(0, limit);
  }

  return { items, categoriesUsed, strategy };
}

/**
 * getRecommendations
 *
 * Core entrypoint för storefront:
 * - Tar emot sessionId + ev. currentProductId.
 * - Försöker först hitta kategori-baserade rekommendationer.
 * - Faller tillbaka till “trending” om det inte finns tillräckligt bra signaler.
 *
 * Returnerar en ren lista med RecommendedProduct som storefront kan rendera direkt.
 */


/**
 * Publik funktion för storefront – returnerar bara produkter.
 */
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

/**
 * getRecommendationsWithDebug
 *
 * - Samma logik som getRecommendations, men returnerar också ett `debug`-objekt
 *   som adminpanelen kan visa:
 *   - strategy (t.ex. "category_and_trending")
 *   - sessionId / currentProductId
 *   - limit
 *   - categoriesUsed (vilka kategorier som faktiskt användes)
 *
 * Syfte:
 * - Göra motorn “förklarbar” för en människa:
 *   man ser direkt *varför* en viss lista med produkter föreslogs.
 */


/**
 * Admin-debug – samma logik, plus metadata.
 */
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
