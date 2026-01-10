import type { Request, Response } from "express";
import {
  getRecommendationsWithDebug,
} from "../services/recommendationEngine.js";

/**
 * /recommendations – används av storefront
 * Returnerar:
 * {
 *   ok: true,
 *   items: [...],
 *   meta: {
 *     sessionId,
 *     currentProductId,
 *     limit,
 *     strategy,
 *     categoriesUsed: string[]
 *   }
 * }
 */
export async function getRecommendationsHandler(req: Request, res: Response) {
  try {
    const sessionId =
      (req.query.sessionId as string | undefined) ??
      (req.query.session_id as string | undefined) ??
      null;

    const currentProductIdParam =
      (req.query.currentProductId as string | undefined) ??
      (req.query.current_product_id as string | undefined);

    const currentProductId = currentProductIdParam
      ? Number.parseInt(currentProductIdParam, 10)
      : null;

    const limitParam = req.query.limit as string | undefined;
    const limit = limitParam ? Number.parseInt(limitParam, 10) : 8;

    const result = await getRecommendationsWithDebug({
      sessionId,
      currentProductId,
      limit,
    });

    const strategy = result.debug?.strategy ?? "unknown";
    const categoriesUsed = result.debug?.categoriesUsed ?? [];

    res.json({
      ok: true,
      items: result.items,
      meta: {
        sessionId,
        currentProductId,
        limit,
        strategy,
        categoriesUsed,
      },
    });
  } catch (err) {
    console.error("Failed to get recommendations:", err);
    res.status(500).json({
      ok: false,
      error: "Failed to fetch recommendations",
    });
  }
}

/**
 * /admin/recommendations/preview – används av adminpanelen
 * Returnerar:
 * {
 *   ok: true,
 *   items: [...],
 *   debug: {
 *     strategy,
 *     sessionId,
 *     currentProductId,
 *     limit,
 *     categoriesUsed: string[]
 *   }
 * }
 */
export async function getRecommendationsPreviewHandler(
  req: Request,
  res: Response
) {
  try {
    const sessionId =
      (req.query.sessionId as string | undefined) ??
      (req.query.session_id as string | undefined) ??
      null;

    const currentProductIdParam =
      (req.query.currentProductId as string | undefined) ??
      (req.query.current_product_id as string | undefined);

    const currentProductId = currentProductIdParam
      ? Number.parseInt(currentProductIdParam, 10)
      : null;

    const limitParam = req.query.limit as string | undefined;
    const limit = limitParam ? Number.parseInt(limitParam, 10) : 8;

    const result = await getRecommendationsWithDebug({
      sessionId,
      currentProductId,
      limit,
    });

    res.json({
      ok: true,
      items: result.items,
      debug: result.debug,
    });
  } catch (err) {
    console.error("Failed to get recommendations preview:", err);
    res.status(500).json({
      ok: false,
      error: "Failed to fetch recommendations preview",
    });
  }
}
