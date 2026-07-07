import pool from '../../db/pool.js';
import type { User, CreateUserInput } from '@squadup/shared';

export async function createUser(input: CreateUserInput): Promise<User> {
  const result = await pool.query(
    `INSERT INTO users (firebase_uid, display_name, email)
     VALUES ($1, $2, $3)
     RETURNING id, firebase_uid AS "firebaseUid", display_name AS "displayName", email, created_at AS "createdAt"`,
    [input.firebaseUid, input.displayName, input.email ?? null]
  );
  return result.rows[0];
}

export async function getUserById(id: string): Promise<User | null> {
  const result = await pool.query(
    `SELECT id, firebase_uid AS "firebaseUid", display_name AS "displayName", email, created_at AS "createdAt"
     FROM users
     WHERE id = $1`,
    [id]
  );
  return result.rows[0] ?? null;
}