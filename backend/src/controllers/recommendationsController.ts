import { Request, Response, NextFunction } from "express";
import { getRecommendations } from "../services/recommendationEngine.js";

export async function getRecommendationsHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const sessionId =
      typeof req.query.sessionId === "string" ? req.query.sessionId : undefined;

    const currentProductId =
      typeof req.query.currentProductId === "string"
        ? Number(req.query.currentProductId)
        : undefined;

    const limit =
      typeof req.query.limit === "string"
        ? Number(req.query.limit)
        : undefined;

    const items = await getRecommendations({
      sessionId,
      currentProductId,
      limit,
    });

    res.json({
      items,
      meta: {
        sessionId: sessionId ?? null,
        currentProductId: currentProductId ?? null,
        limit: limit ?? 8,
      },
    });
  } catch (err) {
    next(err);
  }
}
