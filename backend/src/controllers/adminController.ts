import { Request, Response, NextFunction } from "express";
import { getRecommendations } from "../services/recommendationEngine.js";
// ...ev. övriga imports

// ...befintliga admin-handlers (events, products etc.)

export async function getRecommendationsPreviewHandler(
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

    const items = await getRecommendations({
      sessionId,
      currentProductId,
      limit: 8,
    });

    res.json({
      items,
      meta: {
        sessionId: sessionId ?? null,
        currentProductId: currentProductId ?? null,
      },
    });
  } catch (err) {
    next(err);
  }
}
