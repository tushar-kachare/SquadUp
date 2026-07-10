import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import * as gamesController from "./games.controller.js";

const router = Router();

router.post("/", requireAuth, gamesController.createGame);
router.get("/", gamesController.getGames);
router.get('/nearby', gamesController.getNearbyGames);
router.get("/:id", gamesController.getGameById);
router.post("/:id/join", requireAuth, gamesController.joinGame);
router.delete("/:id/leave", requireAuth, gamesController.leaveGame);
router.patch("/:id/cancel", requireAuth, gamesController.cancelGame);
export default router;
