import type { Request, Response } from "express";
import * as gamesService from "./games.service.js";
import { sendSuccess, sendError } from "../../utils/apiResponse.js";

type GameParams = {
  id: string;
};

export async function createGame(req: Request, res: Response) {
  try {
    const game = await gamesService.createGame(req.body);
    sendSuccess(res, game, undefined, 201);
  } catch (err) {
    console.error("Error creating game:", err);

    if (err instanceof Error) {
      return sendError(res, err.message, 400);
    }

    sendError(res, "Failed to create game");
  }
}

export async function getGameById(
  req: Request<GameParams>,
  res: Response
) {
  try {
    const game = await gamesService.getGameById(req.params.id);

    if (!game) {
      return sendError(res, "Game not found", 404, "GAME_NOT_FOUND");
    }

    sendSuccess(res, game);
  } catch (err) {
    console.error("Error fetching game:", err);

    if (err instanceof Error) {
      return sendError(res, err.message, 400);
    }

    sendError(res, "Failed to fetch game");
  }
}

export async function getGames(req: Request, res: Response) {
  try {
    const games = await gamesService.getGames();
    sendSuccess(res, games);
  } catch (err) {
    console.error("Error fetching games:", err);

    if (err instanceof Error) {
      return sendError(res, err.message, 400);
    }

    sendError(res, "Failed to fetch games");
  }
}

export async function joinGame(
  req: Request<GameParams>,
  res: Response
) {
  try {
    const { userId } = req.body;

    if (!userId) {
      return sendError(res, "User ID is required", 400);
    }

    const game = await gamesService.joinGame(req.params.id, userId);

    sendSuccess(res, game);
  } catch (err) {
    console.error("Error joining game:", err);

    if (err instanceof Error) {
      return sendError(res, err.message, 400);
    }

    sendError(res, "Failed to join game");
  }
}

export async function cancelGame(
  req: Request<GameParams>,
  res: Response
) {
  try {
    const { userId } = req.body;

    if (!userId) {
      return sendError(res, "User ID is required", 400);
    }

    const game = await gamesService.cancelGame(req.params.id, userId);

    sendSuccess(res, game);
  } catch (err) {
    console.error("Error cancelling game:", err);

    if (err instanceof Error) {
      if (err.message === "Game not found") {
        return sendError(res, err.message, 404, "GAME_NOT_FOUND");
      }

      if (err.message === "Only the creator can cancel this game") {
        return sendError(res, err.message, 403, "FORBIDDEN");
      }

      return sendError(res, err.message, 400);
    }

    sendError(res, "Failed to cancel game");
  }
}
