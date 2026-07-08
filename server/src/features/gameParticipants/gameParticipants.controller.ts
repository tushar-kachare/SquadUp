import type { Request, Response } from "express";
import * as gameParticipantsService from "./gameParticipants.service.js";
import { sendSuccess, sendError } from "../../utils/apiResponse.js";

type GameParticipantParams = {
  gameId: string;
};

export async function getGameParticipants(
  req: Request<GameParticipantParams>,
  res: Response,
) {
  try {
    const participants = await gameParticipantsService.getGameParticipants(
      req.params.gameId,
    );

    sendSuccess(res, participants);
  } catch (err) {
    console.error("Error fetching game participants:", err);

    if (err instanceof Error) {
      if (err.message === "Game not found") {
        return sendError(res, err.message, 404, "GAME_NOT_FOUND");
      }

      return sendError(res, err.message, 400);
    }

    sendError(res, "Failed to fetch game participants");
  }
}
