import cron from "node-cron";
import { expireOpenGames } from "../features/games/games.service.js";

export function startExpiryJob() {
  cron.schedule("* * * * *", async () => {
    try {
      const expiredGameIds = await expireOpenGames();

      if (expiredGameIds.length > 0) {
        console.log(`Expired ${expiredGameIds.length} game(s): ${expiredGameIds.join(", ")}`);
      }
    } catch (err) {
      console.error("Failed to expire open games:", err);
    }
  });
}
