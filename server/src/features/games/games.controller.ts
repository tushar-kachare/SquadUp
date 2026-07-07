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
    sendError(res, "Failed to fetch game");
  }
}

export async function getGames(req: Request, res: Response) {
  try {
    const games = await gamesService.getGames();
    sendSuccess(res, games);
  } catch (err) {
    console.error("Error fetching games:", err);
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
    sendError(res, "Failed to join game");
  }
}