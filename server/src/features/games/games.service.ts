import pool from "../../db/pool.js";
import { io } from "../../sockets/index.js";
import { getAreaRoomKey } from "../../sockets/geoRoom.js";
import type {
  CreateGameInput,
  Game,
  NewGameCreatedEvent,
  SlotUpdatedEvent,
} from "@squadup/shared";

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

interface FindNearbyGamesParams {
  lat: number;
  lng: number;
  radiusKm: number;
  sportId?: number;
}

interface ExpiredGameRow {
  id: string;
  currentPlayers: number;
}

interface LockedGameRow {
  id: string;
  creatorId: string;
  currentPlayers: number;
  maxPlayers: number;
  status: Game["status"];
}

export async function createGame(gameData: CreateGameInput) {
  const {
    creatorId,
    sportId,
    latitude,
    longitude,
    locationName,
    minPlayers,
    maxPlayers,
    startTime,
  } = gameData;

  if (!locationName.trim()) {
    throw new Error("Location name is required");
  }

  if (latitude < -90 || latitude > 90) {
    throw new Error("Invalid latitude");
  }

  if (longitude < -180 || longitude > 180) {
    throw new Error("Invalid longitude");
  }

  if (minPlayers > maxPlayers) {
    throw new Error("Minimum players cannot exceed maximum players");
  }

  const start = new Date(startTime);

  if (start <= new Date()) {
    throw new Error("Start time must be in the future");
  }

  const expiresAt = new Date(start);
  expiresAt.setMinutes(expiresAt.getMinutes() - 15);

  const validation = await pool.query(
    `SELECT
      EXISTS (SELECT 1 FROM users WHERE id = $1) AS "creatorExists",
      EXISTS (SELECT 1 FROM sports WHERE id = $2) AS "sportExists"`,
    [creatorId, sportId],
  );

  const { creatorExists, sportExists } = validation.rows[0];

  if (!creatorExists) {
    throw new Error("Creator not found");
  }

  if (!sportExists) {
    throw new Error("Sport not found");
  }

  const existingGame = await pool.query(
    `SELECT 1
   FROM games
   WHERE creator_id = $1
     AND sport_id = $2
     AND status = 'open'
   LIMIT 1`,
    [creatorId, sportId],
  );

  if (existingGame.rowCount) {
    throw new Error("You already have an active game for this sport");
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const gameResult = await client.query(
      `INSERT INTO games (
        creator_id,
        sport_id,
        location,
        location_name,
        min_players,
        max_players,
        start_time,
        expires_at
      )
      VALUES (
        $1,
        $2,
        ST_SetSRID(ST_MakePoint($3, $4), 4326)::geography,
        $5,
        $6,
        $7,
        $8,
        $9
      )
      RETURNING
        id,
        creator_id AS "creatorId",
        sport_id AS "sportId",
        location_name AS "locationName",
        ST_Y(location::geometry) AS latitude,
        ST_X(location::geometry) AS longitude,
        min_players AS "minPlayers",
        max_players AS "maxPlayers",
        current_players AS "currentPlayers",
        status,
        start_time AS "startTime",
        expires_at AS "expiresAt",
        created_at AS "createdAt"`,
      [
        creatorId,
        sportId,
        longitude,
        latitude,
        locationName,
        minPlayers,
        maxPlayers,
        start,
        expiresAt,
      ],
    );

    const game = gameResult.rows[0];

    await client.query(
      `INSERT INTO game_participants (game_id, user_id)
       VALUES ($1, $2)`,
      [game.id, creatorId],
    );

    await client.query("COMMIT");

    io.to(getAreaRoomKey(game.latitude, game.longitude)).emit(
      "newGameCreated",
      game satisfies NewGameCreatedEvent,
    );

    return game;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function getGameById(id: string) {
  const query = `
    SELECT
      g.id,
      g.creator_id AS "creatorId",
      g.sport_id AS "sportId",
      g.location_name AS "locationName",
      ST_Y(g.location::geometry) AS latitude,
      ST_X(g.location::geometry) AS longitude,
      g.min_players AS "minPlayers",
      g.max_players AS "maxPlayers",
      g.current_players AS "currentPlayers",
      g.status,
      g.start_time AS "startTime",
      g.expires_at AS "expiresAt",
      g.created_at AS "createdAt"
    FROM games g
    WHERE g.id = $1;
  `;

  const result = await pool.query(query, [id]);

  return result.rows[0] ?? null;
}

export async function getGames() {
  const query = `
    SELECT
      g.id,
      g.creator_id AS "creatorId",
      g.sport_id AS "sportId",
      g.location_name AS "locationName",
      ST_Y(g.location::geometry) AS latitude,
      ST_X(g.location::geometry) AS longitude,
      g.min_players AS "minPlayers",
      g.max_players AS "maxPlayers",
      g.current_players AS "currentPlayers",
      g.status,
      g.start_time AS "startTime",
      g.expires_at AS "expiresAt",
      g.created_at AS "createdAt"
    FROM games g
    ORDER BY g.created_at DESC;
  `;

  const result = await pool.query(query);

  return result.rows;
}

export async function joinGame(gameId: string, userId: string) {
  if (!uuidRegex.test(userId)) {
    throw new Error("Invalid user ID");
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const userResult = await client.query(
      `SELECT EXISTS (SELECT 1 FROM users WHERE id = $1) AS "userExists"`,
      [userId],
    );

    if (!userResult.rows[0].userExists) {
      throw new Error("User not found");
    }

    const gameResult = await client.query( // this is lock mechanism due to 'FOR UPDATE', it locks the row for the duration of the transaction to prevent race conditions when multiple users try to join the same game simultaneously. This ensures that the current player count is accurate and prevents overbooking of the game.
      `SELECT
        id,
        current_players AS "currentPlayers",
        max_players AS "maxPlayers",
        status
       FROM games
       WHERE id = $1
       FOR UPDATE`,
      [gameId],
    );

    const game = gameResult.rows[0];

    if (!game) {
      throw new Error("Game not found");
    }

    if (game.status !== "open") {
      throw new Error("Game is not open");
    }

    const participantResult = await client.query(
      `SELECT 1
       FROM game_participants
       WHERE game_id = $1
         AND user_id = $2
       LIMIT 1`,
      [gameId, userId],
    );

    if (participantResult.rowCount) {
      throw new Error("User already joined this game");
    }

    if (game.currentPlayers >= game.maxPlayers) {
      throw new Error("Game is full");
    }

    const nextCurrentPlayers = game.currentPlayers + 1;
    const nextStatus = nextCurrentPlayers >= game.maxPlayers ? "full" : "open";

    await client.query(
      `INSERT INTO game_participants (game_id, user_id)
       VALUES ($1, $2)`,
      [gameId, userId],
    );

    const updatedGameResult = await client.query(
      `UPDATE games
       SET
        current_players = $2,
        status = $3
       WHERE id = $1
       RETURNING
        id,
        creator_id AS "creatorId",
        sport_id AS "sportId",
        location_name AS "locationName",
        ST_Y(location::geometry) AS latitude,
        ST_X(location::geometry) AS longitude,
        min_players AS "minPlayers",
        max_players AS "maxPlayers",
        current_players AS "currentPlayers",
        status,
        start_time AS "startTime",
        expires_at AS "expiresAt",
        created_at AS "createdAt"`,
      [gameId, nextCurrentPlayers, nextStatus],
    );

    await client.query("COMMIT");

    const updatedGame = updatedGameResult.rows[0];

    io.to(`game-${gameId}`).emit("slotUpdated", {
      gameId,
      currentPlayers: updatedGame.currentPlayers,
      status: updatedGame.status,
    } satisfies SlotUpdatedEvent);

    return updatedGame;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function leaveGame(gameId: string, userId: string) {
  if (!uuidRegex.test(userId)) {
    throw new Error("Invalid user ID");
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const gameResult = await client.query<LockedGameRow>(
      `SELECT
        id,
        creator_id AS "creatorId",
        current_players AS "currentPlayers",
        max_players AS "maxPlayers",
        status
       FROM games
       WHERE id = $1
       FOR UPDATE`,
      [gameId],
    );

    const game = gameResult.rows[0];

    if (!game) {
      throw new Error("Game not found");
    }

    if (userId === game.creatorId) {
      throw new Error("Creator cannot leave, use cancel instead");
    }

    const participantResult = await client.query(
      `SELECT 1
       FROM game_participants
       WHERE game_id = $1
         AND user_id = $2
       LIMIT 1`,
      [gameId, userId],
    );

    if (!participantResult.rowCount) {
      throw new Error("User is not a participant in this game");
    }

    await client.query(
      `DELETE FROM game_participants
       WHERE game_id = $1
         AND user_id = $2`,
      [gameId, userId],
    );

    const nextCurrentPlayers = game.currentPlayers - 1;
    const nextStatus =
      game.status === "full" && nextCurrentPlayers < game.maxPlayers
        ? "open"
        : game.status;

    const updatedGameResult = await client.query(
      `UPDATE games
       SET
        current_players = $2,
        status = $3
       WHERE id = $1
       RETURNING
        id,
        creator_id AS "creatorId",
        sport_id AS "sportId",
        location_name AS "locationName",
        ST_Y(location::geometry) AS latitude,
        ST_X(location::geometry) AS longitude,
        min_players AS "minPlayers",
        max_players AS "maxPlayers",
        current_players AS "currentPlayers",
        status,
        start_time AS "startTime",
        expires_at AS "expiresAt",
        created_at AS "createdAt"`,
      [gameId, nextCurrentPlayers, nextStatus],
    );

    await client.query("COMMIT");

    const updatedGame = updatedGameResult.rows[0];

    io.to(`game-${gameId}`).emit("slotUpdated", {
      gameId,
      currentPlayers: updatedGame.currentPlayers,
      status: updatedGame.status,
    } satisfies SlotUpdatedEvent);

    return updatedGame;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function expireOpenGames() {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const expiredGamesResult = await client.query<ExpiredGameRow>(
      `SELECT
        id,
        current_players AS "currentPlayers"
       FROM games
       WHERE status = 'open'
         AND expires_at <= NOW()
       FOR UPDATE`,
    );

    const expiredGames = expiredGamesResult.rows;

    if (expiredGames.length > 0) {
      await client.query(
        `UPDATE games
         SET status = 'expired'
         WHERE id = ANY($1::uuid[])`,
        [expiredGames.map((game) => game.id)],
      );
    }

    await client.query("COMMIT");

    for (const game of expiredGames) {
      io.to(`game-${game.id}`).emit("slotUpdated", {
        gameId: game.id,
        currentPlayers: game.currentPlayers,
        status: "expired",
      } satisfies SlotUpdatedEvent);
    }

    return expiredGames.map((game) => game.id);
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function cancelGame(gameId: string, userId: string) {
  if (!uuidRegex.test(gameId)) {
    throw new Error("Invalid game ID");
  }

  if (!uuidRegex.test(userId)) {
    throw new Error("Invalid user ID");
  }

  const gameResult = await pool.query(
    `SELECT
      id,
      creator_id AS "creatorId",
      status
     FROM games
     WHERE id = $1`,
    [gameId],
  );

  const game = gameResult.rows[0];

  if (!game) {
    throw new Error("Game not found");
  }

  if (game.creatorId !== userId) {
    throw new Error("Only the creator can cancel this game");
  }

  if (game.status === "cancelled") {
    throw new Error("Game is already cancelled");
  }

  if (game.status === "expired") {
    throw new Error("Game is already expired");
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const updatedGameResult = await client.query(
      `UPDATE games
       SET status = 'cancelled'
       WHERE id = $1
       RETURNING
        id,
        creator_id AS "creatorId",
        sport_id AS "sportId",
        location_name AS "locationName",
        ST_Y(location::geometry) AS latitude,
        ST_X(location::geometry) AS longitude,
        min_players AS "minPlayers",
        max_players AS "maxPlayers",
        current_players AS "currentPlayers",
        status,
        start_time AS "startTime",
        expires_at AS "expiresAt",
        created_at AS "createdAt"`,
      [gameId],
    );

    await client.query("COMMIT");

    return updatedGameResult.rows[0];
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

export async function findNearbyGames(params: FindNearbyGamesParams) {
  const { lat, lng, radiusKm, sportId } = params;
  const radiusMeters = radiusKm * 1000;

  const values: (number | string)[] = [lng, lat, radiusMeters];
  let sportFilter = "";

  if (sportId !== undefined) {
    values.push(sportId);
    sportFilter = `AND g.sport_id = $${values.length}`;
  }

  const query = `
    SELECT
      g.id,
      g.creator_id AS "creatorId",
      g.sport_id AS "sportId",
      s.name AS "sportName",
      ST_Y(g.location::geometry) AS "latitude",
      ST_X(g.location::geometry) AS "longitude",
      g.location_name AS "locationName",
      g.min_players AS "minPlayers",
      g.max_players AS "maxPlayers",
      g.current_players AS "currentPlayers",
      g.status,
      g.start_time AS "startTime",
      g.expires_at AS "expiresAt",
      g.created_at AS "createdAt",
      ST_Distance(g.location, ST_MakePoint($1, $2)::geography) AS "distanceMeters"
    FROM games g
    JOIN sports s ON s.id = g.sport_id
    WHERE g.status = 'open'
      AND ST_DWithin(g.location, ST_MakePoint($1, $2)::geography, $3)
      ${sportFilter}
    ORDER BY "distanceMeters" ASC;
  `;

  const result = await pool.query(query, values);
  return result.rows;
}
