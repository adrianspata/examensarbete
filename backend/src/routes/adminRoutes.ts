import { Router } from "express";
import { listEvents } from "../controllers/adminController.js";

const router = Router();

router.get("/events", listEvents);

export default router;
