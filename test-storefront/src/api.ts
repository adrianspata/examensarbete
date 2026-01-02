const API_URL = "http://localhost:4000";

export type Product = {
  id: number;
  sku: string;
  name: string;
  category: string;
  priceCents: number;
  imageUrl: string;
};

export async function listProducts(): Promise<{ products: Product[] }> {
  const res = await fetch(`${API_URL}/products`);
  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

export async function sendEvent(payload: {
  sessionId: string;
  productId: number;
  eventType: string;
  userId?: string | null;
}) {
  await fetch(`${API_URL}/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
