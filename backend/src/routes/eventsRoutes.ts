import { Router } from "express";
import { createEventHandler } from "../controllers/eventsController.js";

const router = Router();

// POST /events
router.post("/", createEventHandler);

export default router;