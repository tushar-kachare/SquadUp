import { Router } from "express";
import * as gamesController from "./games.controller.js";

const router = Router();

router.post("/", gamesController.createGame);
router.get("/", gamesController.getGames);
router.get("/:id", gamesController.getGameById);
router.post("/:id/join", gamesController.joinGame);

export default router;
