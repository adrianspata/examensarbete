// backend/src/routes/adminRoutes.ts
import { Router } from "express";
import {
  getAdminProductsHandler,
  getAdminEventsHandler,
} from "../controllers/adminController.js";
import { getRecommendationsPreviewHandler } from "../controllers/recommendationsController.js";

const router = Router();

router.get("/products", getAdminProductsHandler);
router.get("/events", getAdminEventsHandler);
router.get("/recommendations/preview", getRecommendationsPreviewHandler);

export default router;
