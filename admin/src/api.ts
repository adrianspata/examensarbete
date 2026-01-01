const API_BASE_URL = "http://localhost:4000";

export interface HealthResponse {
  status: string;
  service: string;
}

export interface ProductSummary {
  id: number;
  sku: string;
  name: string;
  category: string;
  priceCents: number;
  imageUrl: string | null;
}

export async function fetchHealth(): Promise<HealthResponse> {
  const res = await fetch(`${API_BASE_URL}/health`);

  if (!res.ok) {
    throw new Error(`Health check failed with status ${res.status}`);
  }

  return res.json();
}

export async function fetchProducts(): Promise<ProductSummary[]> {
  const res = await fetch(`${API_BASE_URL}/products`);

  if (!res.ok) {
    throw new Error(`Failed to load products. Status: ${res.status}`);
  }

  const data = (await res.json()) as ProductSummary[];
  return data;
}
