import pool from '../../db/pool.js';
import type { User, CreateUserInput } from '@squadup/shared';

export async function createUser(input: CreateUserInput): Promise<User> {
  const result = await pool.query(
    `INSERT INTO users (firebase_uid, display_name, email)
     VALUES ($1, $2, $3)
     RETURNING id, display_name AS "displayName", email, created_at AS "createdAt"`,
    [input.firebaseUid, input.displayName, input.email ?? null]
  );
  return result.rows[0];
}

export async function getUserById(id: string): Promise<User | null> {
  const result = await pool.query(
    `SELECT id, display_name AS "displayName", email, created_at AS "createdAt"
     FROM users
     WHERE id = $1`,
    [id]
  );
  return result.rows[0] ?? null;
}

export async function getUserIdByFirebaseUid(firebaseUid: string): Promise<string> {
  const result = await pool.query<{ id: string }>(
    `SELECT id
     FROM users
     WHERE firebase_uid = $1`,
    [firebaseUid],
  );

  const user = result.rows[0];

  if (!user) {
    throw new Error("User not synced");
  }

  return user.id;
}

export async function syncUser(
  firebaseUid: string,
  displayName: string,
  email?: string | null,
): Promise<User> {
  const existingUser = await pool.query(
    `SELECT id, display_name AS "displayName", email, created_at AS "createdAt"
     FROM users
     WHERE firebase_uid = $1`,
    [firebaseUid],
  );

  if (existingUser.rows[0]) {
    return existingUser.rows[0];
  }

  const createdUser = await pool.query(
    `INSERT INTO users (firebase_uid, display_name, email)
     VALUES ($1, $2, $3)
     RETURNING id, display_name AS "displayName", email, created_at AS "createdAt"`,
    [firebaseUid, displayName, email ?? null],
  );

  return createdUser.rows[0];
}
