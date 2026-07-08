import type { GameParticipant } from "@squadup/shared";
import { apiRequest } from "./client";

export function getGameParticipants(gameId: string) {
  return apiRequest<GameParticipant[]>(`/game-participants/${gameId}`);
}
