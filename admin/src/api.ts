const API_URL = "http://localhost:4000";

export type AdminEvent = {
  id: number;
  sessionId: string;
  userId: string | null;
  productId: number;
  eventType: string;
  createdAt: string;
  productSku: string;
  productName: string;
};

export type Product = {
  id: number;
  sku: string;
  name: string;
  category: string;
  priceCents: number;
  imageUrl: string;
};

export async function listEvents(): Promise<{ events: AdminEvent[] }> {
  const resp = await fetch(`${API_URL}/admin/events`);
  if (!resp.ok) throw new Error("Failed to fetch events");
  return resp.json();
}

export async function listProducts(): Promise<{ products: Product[] }> {
  const resp = await fetch(`${API_URL}/products`);
  if (!resp.ok) throw new Error("Failed to fetch products");
  return resp.json();
}

export async function getRecommendations(sessionId: string): Promise<{ recommendations: Product[] }> {
  const resp = await fetch(`${API_URL}/recommendations?sessionId=${encodeURIComponent(sessionId)}`);
  if (!resp.ok) throw new Error("Failed to fetch recommendations");
  return resp.json();
}
