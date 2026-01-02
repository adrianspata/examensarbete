import express from "express";
import cors from "cors";
import morgan from "morgan";

import eventsRoutes from "./routes/eventsRoutes.js";
import recommendationsRoutes from "./routes/recommendationsRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import productsRoutes from "./routes/productsRoutes.js";

const app = express();

app.use(cors({ origin: true }));
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/events", eventsRoutes);
app.use("/recommendations", recommendationsRoutes);
app.use("/admin", adminRoutes);
app.use("/products", productsRoutes);

export default app;
