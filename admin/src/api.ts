const API_BASE = "http://localhost:4000";

// Gemensam helper för JSON-svar
async function handleJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `Request failed with ${res.status} ${res.statusText}: ${text}`
    );
  }
  return (await res.json()) as T;
}

/* Health */

export interface HealthResponse {
  ok: boolean;
  message?: string;
}

export async function fetchHealth(): Promise<HealthResponse> {
  const res = await fetch(`${API_BASE}/health`);
  return handleJson<HealthResponse>(res);
}

/* Products */

export interface Product {
  id: number;
  sku: string;
  name: string;
  category: string | null;
  image_url?: string | null;
  imageUrl?: string | null;
}

export async function listProducts(): Promise<Product[]> {
  const res = await fetch(`${API_BASE}/admin/products`);
  return handleJson<Product[]>(res);
}

/* Events */

export interface EventRow {
  id: number;
  session_id: string;
  event_type: string;
  created_at: string;
  product_sku: string | null;
  product_name: string | null;
}

export async function listEvents(): Promise<EventRow[]> {
  const res = await fetch(`${API_BASE}/admin/events`);
  return handleJson<EventRow[]>(res);
}

/* Recommendations preview */

export interface RecommendationsPreviewItem extends Product {}

export interface RecommendationsPreviewDebug {
  strategy: string;
  sessionId: string | null;
  currentProductId: number | null;
  limit: number;
  categoriesUsed: string[];
}

export interface RecommendationsPreviewResponse {
  ok: boolean;
  items: RecommendationsPreviewItem[];
  debug?: RecommendationsPreviewDebug;
}

export interface RecommendationsPreviewParams {
  sessionId?: string;
  currentProductId?: number;
  limit?: number;
}

export async function fetchRecommendationsPreview(
  params: RecommendationsPreviewParams
): Promise<RecommendationsPreviewResponse> {
  const qs = new URLSearchParams();
  if (params.sessionId) qs.set("sessionId", params.sessionId);
  if (typeof params.currentProductId === "number") {
    qs.set("currentProductId", String(params.currentProductId));
  }
  if (typeof params.limit === "number") {
    qs.set("limit", String(params.limit));
  }

  const url = `${API_BASE}/admin/recommendations/preview?${
    qs.toString() || ""
  }`;

  const res = await fetch(url);
  return handleJson<RecommendationsPreviewResponse>(res);
}
