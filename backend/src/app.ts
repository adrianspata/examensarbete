import express, { Application } from "express";
import cors from "cors";

const app: Application = express();

// Grundkonfiguration
app.use(cors());
app.use(express.json());

// Health check – används för att snabbt verifiera att backend lever
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "ppfe-backend" });
});

export default app;
