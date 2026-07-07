import pool from '../../db/pool.js';
import type { CreateGameInput } from "@squadup/shared";

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
    throw new Error('Location name is required');
  }

  if (latitude < -90 || latitude > 90) {
    throw new Error('Invalid latitude');
  }

  if (longitude < -180 || longitude > 180) {
    throw new Error('Invalid longitude');
  }

  if (minPlayers > maxPlayers) {
    throw new Error('Minimum players cannot exceed maximum players');
  }

  const start = new Date(startTime);

  if (start <= new Date()) {
    throw new Error('Start time must be in the future');
  }

  const expiresAt = new Date(start);
  expiresAt.setMinutes(expiresAt.getMinutes() - 15);

  const validation = await pool.query(
    `SELECT
      EXISTS (SELECT 1 FROM users WHERE id = $1) AS "creatorExists",
      EXISTS (SELECT 1 FROM sports WHERE id = $2) AS "sportExists"`,
    [creatorId, sportId]
  );

  const { creatorExists, sportExists } = validation.rows[0];

  if (!creatorExists) {
    throw new Error('Creator not found');
  }

  if (!sportExists) {
    throw new Error('Sport not found');
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

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
      ]
    );

    const game = gameResult.rows[0];

    await client.query(
      `INSERT INTO game_participants (game_id, user_id)
       VALUES ($1, $2)`,
      [game.id, creatorId]
    );

    await client.query('COMMIT');

    return game;
  } catch (err) {
    await client.query('ROLLBACK');
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
  // Phase 1:
  // Simple implementation
  // Phase 3:
  // Transaction + row locking + Socket.io

  return {};
}
