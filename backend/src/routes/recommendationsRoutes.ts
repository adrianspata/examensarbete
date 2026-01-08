import { Router } from "express";
import {
  getRecommendationsHandler,
  getRecommendationsPreviewHandler,
} from "../controllers/recommendationsController.js";

const router = Router();

// används av storefront-widget / test-storefront
router.get("/", getRecommendationsHandler);

// admin-preview (om du vill ha den här också – du har även /admin/... route)
router.get("/preview", getRecommendationsPreviewHandler);

export default router;
