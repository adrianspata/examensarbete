import { Router } from "express";
import { getRecommendationsHandler } from "../controllers/recommendationsController.js";

const router = Router();

// GET /recommendations?sessionId=...&currentProductId=...&limit=...
router.get("/", getRecommendationsHandler);

export default router;
