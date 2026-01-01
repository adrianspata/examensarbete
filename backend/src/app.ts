import express, { type Application } from "express";
import morgan from "morgan";
import cors from "cors";

import eventsRoutes from "./routes/eventsRoutes.js";
import recommendationsRoutes from "./routes/recommendationsRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import productsRoutes from "./routes/productsRoutes.js";

const app: Application = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "ppfe-backend",
  });
});

app.use("/events", eventsRoutes);
app.use("/recommendations", recommendationsRoutes);
app.use("/admin", adminRoutes);
app.use("/products", productsRoutes);

export default app;
