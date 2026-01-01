import { Router } from "express";
import { collectEvent } from "../controllers/eventsController.js";

const router = Router();

// Tar emot events från storefront/widget
router.post("/", collectEvent);

export default router;
