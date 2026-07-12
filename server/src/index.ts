import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "node:http";
import pool from "./db/pool.js";
import sportsRoutes from "./features/sports/sports.routes.js";
import usersRoutes from "./features/users/users.routes.js";
import gamesRoutes from "./features/games/games.routes.js";
import gameParticipantsRoutes from "./features/gameParticipants/gameParticipants.routes.js";
import pushRoutes from "./features/push/push.routes.js";
import { startExpiryJob } from "./jobs/expireGames.job.js";
import { initSocket } from "./sockets/index.js";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/sports", sportsRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/games", gamesRoutes);
app.use("/api/game-participants", gameParticipantsRoutes);
app.use("/api/push", pushRoutes);
app.get("/health", (_req, res) => {
  res.status(200).send("OK");
});

app.get("/health/db", async (req, res) => {
  try {
    const result = await pool.query("SELECT PostGIS_Version();");
    res.json({ status: "ok", postgis: result.rows[0] });
  } catch (err) {
    res.status(500).json({ status: "error", message: (err as Error).message });
  }
});

const PORT = process.env.PORT || 5000;
const httpServer = createServer(app);

initSocket(httpServer);
startExpiryJob();

httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));
