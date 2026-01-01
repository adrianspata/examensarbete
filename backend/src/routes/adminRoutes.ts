import { Router } from "express";
import {
  getEvents,
  getRecommendationsPreview,
} from "../controllers/adminController.js";

const router = Router();

// Enkel loggvy över events för admin
router.get("/events", getEvents);

// Förhandsgranskning av rekommendationsmotorn i admin
router.get("/recommendations/preview", getRecommendationsPreview);

export default router;
