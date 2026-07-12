import dotenv from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import webpush from "web-push";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: resolve(__dirname, "../../../.env") });

const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

if (!vapidPublicKey || !vapidPrivateKey) {
  throw new Error("VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY must be configured");
}

webpush.setVapidDetails(
  process.env.VAPID_EMAIL || "mailto:test@squadup.app",
  vapidPublicKey,
  vapidPrivateKey,
);

export default webpush;
