import { Router } from "express";
import * as gameParticipantsController from "./gameParticipants.controller.js";

const router = Router();

router.get("/:gameId", gameParticipantsController.getGameParticipants);

export default router;
