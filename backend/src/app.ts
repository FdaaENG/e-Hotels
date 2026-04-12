import express from "express";
import cors from "cors";
import authRoutes from "./modules/auth/auth.routes.js";
import roomsRoutes from "./modules/room/room.routes.js";
import miscRoutes from "./modules/misc/misc.routes.js";

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/misc", miscRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomsRoutes);

app.get("/", (_req, res) => {
  res.send("Backend is running");
});

export default app;