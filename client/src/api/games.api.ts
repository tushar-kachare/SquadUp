import type { CreateGameInput, Game } from "@squadup/shared";
import { apiRequest } from "./client";

export function createGame(input: CreateGameInput) {
  return apiRequest<Game>("/games", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function getGames() {
  return apiRequest<Game[]>("/games");
}

export function getGame(id: string) {
  return apiRequest<Game>(`/games/${id}`);
}

export function joinGame(id: string, userId: string) {
  return apiRequest<Game>(`/games/${id}/join`, {
    method: "POST",
    body: JSON.stringify({ userId }),
  });
}

export function cancelGame(id: string, userId: string) {
  return apiRequest<Game>(`/games/${id}/cancel`, {
    method: "PATCH",
    body: JSON.stringify({ userId }),
  });
}
