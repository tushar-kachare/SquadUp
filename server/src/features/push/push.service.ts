import pool from "../../db/pool.js";

type PushSubscriptionInput = {
  endpoint: string;
  p256dh: string;
  auth: string;
};

export type StoredPushSubscription = PushSubscriptionInput;

export async function savePushSubscription(
  userId: string,
  subscription: PushSubscriptionInput,
): Promise<void> {
  await pool.query(
    `INSERT INTO push_subscriptions (user_id, endpoint, p256dh, auth)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (endpoint) DO UPDATE
     SET user_id = EXCLUDED.user_id,
         p256dh = EXCLUDED.p256dh,
         auth = EXCLUDED.auth`,
    [userId, subscription.endpoint, subscription.p256dh, subscription.auth],
  );
}

export async function removePushSubscription(
  userId: string,
  endpoint: string,
): Promise<void> {
  await pool.query(
    `DELETE FROM push_subscriptions
     WHERE user_id = $1 AND endpoint = $2`,
    [userId, endpoint],
  );
}

export async function getPushSubscriptionsByUserId(
  userId: string,
): Promise<StoredPushSubscription[]> {
  const result = await pool.query<StoredPushSubscription>(
    `SELECT endpoint, p256dh, auth
     FROM push_subscriptions
     WHERE user_id = $1`,
    [userId],
  );

  return result.rows;
}
