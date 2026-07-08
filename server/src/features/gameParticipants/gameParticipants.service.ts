import pool from "../../db/pool.js";
import type { GameParticipant } from "@squadup/shared";

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function getGameParticipants(
  gameId: string,
): Promise<GameParticipant[]> {
  if (!uuidRegex.test(gameId)) {
    throw new Error("Invalid game ID");
  }

  const gameResult = await pool.query(
    `SELECT EXISTS (SELECT 1 FROM games WHERE id = $1) AS "gameExists"`,
    [gameId],
  );

  if (!gameResult.rows[0].gameExists) {
    throw new Error("Game not found");
  }

  const result = await pool.query(
    `SELECT
      gp.id,
      gp.game_id AS "gameId",
      gp.user_id AS "userId",
      gp.joined_at AS "joinedAt",
      json_build_object(
        'id', u.id,
        'firebaseUid', u.firebase_uid,
        'displayName', u.display_name,
        'email', u.email,
        'createdAt', u.created_at
      ) AS user
     FROM game_participants gp
     JOIN users u ON u.id = gp.user_id
     WHERE gp.game_id = $1
     ORDER BY gp.joined_at ASC`,
    [gameId],
  );

  return result.rows;
}
