import pool from "../../db/pool.js";
import type { Sport } from "@squadup/shared";

export async function getAllSports(): Promise<Sport[]> {
  const result = await pool.query(
    `SELECT id, name, min_players AS "minPlayers", max_players AS "maxPlayers", icon
     FROM sports
     ORDER BY name ASC`,
  );
  return result.rows;
}
