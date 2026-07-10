import type { CreateGameInput, Game, NearbyGame } from "@squadup/shared";
import { apiRequest } from "./client";

export type CreateGameRequest = Omit<CreateGameInput, "creatorId">;

export function createGame(input: CreateGameRequest) {
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

export function joinGame(id: string) {
  return apiRequest<Game>(`/games/${id}/join`, {
    method: "POST",
  });
}

export function leaveGame(id: string) {
  return apiRequest<Game>(`/games/${id}/leave`, {
    method: "DELETE",
  });
}

export function cancelGame(id: string) {
  return apiRequest<Game>(`/games/${id}/cancel`, {
    method: "PATCH",
  });
}

export function fetchNearbyGames(
  lat: number,
  lng: number,
  radiusKm: number,
  sportId?: number,
) {
  const searchParams = new URLSearchParams({
    lat: String(lat),
    lng: String(lng),
    radiusKm: String(radiusKm),
  });

  if (sportId !== undefined) {
    searchParams.set("sportId", String(sportId));
  }

  return apiRequest<NearbyGame[]>(`/games/nearby?${searchParams.toString()}`);
}
