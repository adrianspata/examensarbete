import type { Request, Response, NextFunction } from "express";
import { pool } from "../db/pool.js";

export interface ProductResponse {
  id: number;
  sku: string;
  name: string;
  category: string;
  priceCents: number;
  imageUrl: string | null;
}

function mapRow(row: any): ProductResponse {
  return {
    id: row.id,
    sku: row.sku,
    name: row.name,
    category: row.category,
    priceCents: row.price_cents,
    imageUrl: row.image_url,
  };
}

export async function listProducts(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await pool.query(
      `
      SELECT
        id,
        sku,
        name,
        category,
        price_cents,
        image_url
      FROM products
      ORDER BY id ASC;
    `
    );

    const products = result.rows.map(mapRow);
    res.json(products);
  } catch (error) {
    next(error);
  }
}
