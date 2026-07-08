import type { Request, Response } from "express";
import * as gamesService from "./games.service.js";
import { sendSuccess, sendError } from "../../utils/apiResponse.js";

const MIN_RADIUS_KM = 1;
const MAX_RADIUS_KM = 10;
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

export async function getGameById(req: Request<GameParams>, res: Response) {
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

export async function joinGame(req: Request<GameParams>, res: Response) {
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

export async function cancelGame(req: Request<GameParams>, res: Response) {
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

export async function getNearbyGames(req: Request, res: Response) {
  const { lat, lng, radiusKm, sportId } = req.query;

  // Required params
  if (lat === undefined || lng === undefined || radiusKm === undefined) {
    return sendError(
      res,
      "lat, lng, and radiusKm are required",
      400,
      "MISSING_PARAMS",
    );
  }

  const latNum = Number(lat);
  const lngNum = Number(lng);
  const radiusNum = Number(radiusKm);

  // Type/format validation
  if (Number.isNaN(latNum) || Number.isNaN(lngNum) || Number.isNaN(radiusNum)) {
    return sendError(
      res,
      "lat, lng, and radiusKm must be valid numbers",
      400,
      "INVALID_PARAMS",
    );
  }

  // Range validation
  if (latNum < -90 || latNum > 90) {
    return sendError(res, "lat must be between -90 and 90", 400, "INVALID_LAT");
  }
  if (lngNum < -180 || lngNum > 180) {
    return sendError(
      res,
      "lng must be between -180 and 180",
      400,
      "INVALID_LNG",
    );
  }
  if (radiusNum < MIN_RADIUS_KM || radiusNum > MAX_RADIUS_KM) {
    return sendError(
      res,
      `radiusKm must be between ${MIN_RADIUS_KM} and ${MAX_RADIUS_KM}`,
      400,
      "INVALID_RADIUS",
    );
  }

  // Optional sportId validation
  let sportIdNum: number | undefined;
  if (sportId !== undefined) {
    sportIdNum = Number(sportId);
    if (Number.isNaN(sportIdNum)) {
      return sendError(
        res,
        "sportId must be a valid number",
        400,
        "INVALID_SPORT_ID",
      );
    }
  }

  try {
    const games = await gamesService.findNearbyGames({
      lat: latNum,
      lng: lngNum,
      radiusKm: radiusNum,
      ...(sportIdNum !== undefined && { sportId: sportIdNum }),
    });

    return sendSuccess(res, games, { count: games.length });
  } catch (err) {
    console.error("Error fetching nearby games:", err);
    return sendError(
      res,
      "Failed to fetch nearby games",
      500,
      "NEARBY_GAMES_FAILED",
    );
  }
}
