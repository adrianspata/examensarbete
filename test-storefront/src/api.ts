const BASE_URL = "http://localhost:4000";

export interface Product {
  id: number;
  sku: string;
  name: string;
  category: string | null;
  price: number | null;
  image_url: string | null;
  created_at: string;
}

/* Recommendations */

export interface RecommendationsMeta {
  sessionId: string | null;
  currentProductId: number | null;
  limit: number;
  strategy: string;
  categoriesUsed: string[];
}

export interface RecommendationsResponse {
  items: Product[];
  meta: RecommendationsMeta;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `Request failed with ${res.status} ${res.statusText}${
        text ? `: ${text}` : ""
      }`
    );
  }
  return res.json() as Promise<T>;
}

export async function listProducts(): Promise<Product[]> {
  const res = await fetch(`${BASE_URL}/products`);
  const raw = await handleResponse<unknown>(res);

  const arr = Array.isArray(raw)
    ? raw
    : raw && typeof raw === "object" && Array.isArray((raw as any).items)
    ? (raw as any).items
    : raw && typeof raw === "object" && Array.isArray((raw as any).products)
    ? (raw as any).products
    : [];

  return (arr as any[]).map((p) => ({
    ...p,
    // viktigt: storefront renderar product.image_url
    image_url: (p as any).image_url ?? (p as any).imageUrl ?? null,
  })) as Product[];
}

/* Events */

export type EventType = "view" | "click" | "add_to_cart";

export interface EventPayload {
  sessionId: string;
  productId: number;
  eventType: EventType;
  userId?: string | null;
  metadata?: Record<string, unknown>;
}

/**
 * Skicka event till backend.
 * Används när användaren interagerar med en produkt i storefront.
 */
export async function sendEvent(payload: EventPayload): Promise<void> {
  const res = await fetch(`${BASE_URL}/events`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    console.error(
      `Failed to send event: ${res.status} ${res.statusText} ${text}`
    );
  }
}

/**
 * Hämta rekommendationer från backend för en given session,
 * valfritt med currentProductId.
 *
 * Returnerar nu både items + meta (inkl. strategy + categoriesUsed).
 */
export async function getRecommendations(params: {
  sessionId: string;
  currentProductId?: number;
  limit?: number;
}): Promise<RecommendationsResponse> {
  const search = new URLSearchParams();
  search.set("sessionId", params.sessionId);

  if (typeof params.currentProductId === "number") {
    search.set("currentProductId", String(params.currentProductId));
  }
  if (typeof params.limit === "number") {
    search.set("limit", String(params.limit));
  }

  const url = `${BASE_URL}/recommendations?${search.toString()}`;
  const res = await fetch(url);
  const data = await handleResponse<RecommendationsResponse>(res);

  return data;
}
