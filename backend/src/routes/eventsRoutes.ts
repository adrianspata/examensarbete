import { Router } from "express";
import { collectEvent } from "../controllers/eventsController.js";

const router = Router();

router.post("/", collectEvent);

export default router;
