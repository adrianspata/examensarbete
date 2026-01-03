import { Router } from "express";
import {
  // ... andra handlers
  getRecommendationsPreviewHandler,
} from "../controllers/adminController.js";

const router = Router();

// ... andra admin-routes

router.get("/recommendations/preview", getRecommendationsPreviewHandler);

export default router;
