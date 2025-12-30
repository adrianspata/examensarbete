export interface Product {
  id: number;
  sku: string;
  name: string;
  category: string;
  priceCents: number;
  imageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export const PRODUCT_TABLE = "products";

export const createProductsTableSQL = `
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  sku TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price_cents INTEGER NOT NULL,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
`;
