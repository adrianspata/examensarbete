import type { Request, Response } from "express";
import {
  getRecommendations,
  getRecommendationsWithDebug,
} from "../services/recommendationEngine.js";

export async function getRecommendationsHandler(req: Request, res: Response) {
  try {
    const sessionId =
      (req.query.sessionId as string | undefined) ??
      (req.query.session_id as string | undefined) ??
      null;

    const limitParam = req.query.limit as string | undefined;
    const limit = limitParam ? Number.parseInt(limitParam, 10) : 8;

    const result = await getRecommendations({ sessionId, limit });

    res.json({
      ok: true,
      items: result,
    });
  } catch (err) {
    console.error("Failed to get recommendations:", err);
    res.status(500).json({
      ok: false,
      error: "Failed to fetch recommendations",
    });
  }
}

export async function getRecommendationsPreviewHandler(
  req: Request,
  res: Response
) {
  try {
    const sessionId =
      (req.query.sessionId as string | undefined) ??
      (req.query.session_id as string | undefined) ??
      null;

    const currentProductIdParam = req.query.currentProductId as
      | string
      | undefined;
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
      ...result,
    });
  } catch (err) {
    console.error("Failed to get recommendations preview:", err);
    res.status(500).json({
      ok: false,
      error: "Failed to fetch recommendations preview",
    });
  }
}
