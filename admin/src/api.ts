const BASE_URL = "http://localhost:4000";

export type Product = {
  id: number;
  sku: string;
  name: string;
  category: string | null;
  price: number | null;
  imageUrl: string | null;
};

export type EventRow = {
  id: number;
  sessionId: string;
  userId: string | null;
  productId: number | null;
  eventType: string;
  createdAt: string;
  productSku: string | null;
  productName: string | null;
};

export type Recommendation = {
  productId: number;
  score: number;
  reason: string;
  product: Product;
};

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(
      `API error ${res.status}${
        text ? `: ${text.slice(0, 120)}` : ""
      }`
    );
  }
  return res.json() as Promise<T>;
}

export async function fetchHealth(): Promise<string> {
  const res = await fetch(`${BASE_URL}/health`);
  if (!res.ok) {
    throw new Error(`Health check failed (${res.status})`);
  }

  // Försök läsa JSON, annars text
  try {
    const data = (await res.json()) as { status?: string };
    return data.status ?? "ok";
  } catch {
    const text = await res.text();
    return text || "ok";
  }
}

export async function listProducts(): Promise<Product[]> {
  const res = await fetch(`${BASE_URL}/products`);
  return handleResponse<Product[]>(res);
}

export async function listEvents(): Promise<EventRow[]> {
  const res = await fetch(`${BASE_URL}/admin/events`);
  return handleResponse<EventRow[]>(res);
}

export async function previewRecommendations(
  sessionId: string,
  limit: number
): Promise<Recommendation[]> {
  const params = new URLSearchParams({
    sessionId,
    limit: String(limit),
  });

  const res = await fetch(
    `${BASE_URL}/admin/recommendations/preview?${params.toString()}`
  );
  return handleResponse<Recommendation[]>(res);
}
