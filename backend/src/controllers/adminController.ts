import type { Request, Response } from "express";
import pool from "../db/pool.js";

export async function getAdminProductsHandler(req: Request, res: Response) {
  try {
    const result = await pool.query(
      `
      SELECT
        id,
        sku,
        name,
        category,
        image_url
      FROM products
      ORDER BY id ASC
      LIMIT 200
      `
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Failed to load admin products:", err);
    res.status(500).json({
      ok: false,
      error: "Failed to load admin products",
    });
  }
}

export async function getAdminEventsHandler(req: Request, res: Response) {
  try {
    const result = await pool.query(
      `
      SELECT
        e.id,
        e.session_id,
        e.event_type,
        e.created_at,
        p.sku        AS product_sku,
        p.name       AS product_name
      FROM events e
      LEFT JOIN products p
        ON p.id = e.product_id
      ORDER BY e.created_at DESC
      LIMIT 200
      `
    );

    res.json(result.rows);
  } catch (err) {
    console.error("Failed to load admin events:", err);
    res.status(500).json({
      ok: false,
      error: "Failed to load admin events",
    });
  }
}
