import { Router } from "express";
import { getRecommendations } from "../controllers/recommendationsController.js";

const router = Router();

router.get("/", getRecommendations);

export default router;
