import { Router } from "express";
import { getRecommendations } from "../controllers/recommendationsController.js";

const router = Router();

// Hämtar rekommenderade produkter för en given session/user
router.get("/", getRecommendations);

export default router;
