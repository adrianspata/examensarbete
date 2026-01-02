import type { Request, Response } from "express";
import pool from "../db/pool.js";

type ProductRow = {
  id: number;
  sku: string;
  name: string;
  category: string;
  price_cents: number;
  image_url: string;
};

export async function listProducts(_req: Request, res: Response) {
  const result = await pool.query<ProductRow>(
    `SELECT id, sku, name, category, price_cents, image_url
     FROM products
     ORDER BY id ASC`
  );

  const products = result.rows.map((p) => ({
    id: p.id,
    sku: p.sku,
    name: p.name,
    category: p.category,
    priceCents: p.price_cents,
    imageUrl: p.image_url,
  }));

  res.json({ products });
}
