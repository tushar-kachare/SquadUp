export interface Sport {
  id: number;
  name: string;
  minPlayers: number;
  maxPlayers: number;
  icon: string | null;
}

export interface Game {
  id: string;
  creatorId: string;
  sportId: number;
  latitude: number;
  longitude: number;
  locationName: string;
  minPlayers: number;
  maxPlayers: number;
  currentPlayers: number;
  status: "open" | "full" | "expired" | "cancelled";
  startTime: string;
  expiresAt: string;
  createdAt: string;
}
export interface NearbyGame extends Game {
  sportName: string;
  distanceMeters: number;
}
// Query params for GET /api/games/nearby
export interface NearbyGamesQuery {
  lat: number;
  lng: number;
  radiusKm: number;
  sportId?: number;
}
export interface CreateGameInput {
  creatorId: string;
  sportId: number;
  latitude: number;
  longitude: number;
  locationName: string;
  minPlayers: number;
  maxPlayers: number;
  startTime: string;
}

export interface SlotUpdatedEvent {
  gameId: string;
  currentPlayers: number;
  status: Game["status"];
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: Record<string, unknown>;
}

export interface ApiError {
  success: false;
  error: {
    message: string;
    code?: string;
  };
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export interface User {
  id: string;
  firebaseUid: string;
  displayName: string;
  email: string | null;
  createdAt: string;
}

export interface CreateUserInput {
  firebaseUid: string;
  displayName: string;
  email?: string;
}

export interface GameParticipant {
  id: string;
  gameId: string;
  userId: string;
  joinedAt: string;
  user: User;
}
