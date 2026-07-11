import { useEffect, useState } from "react";
import type { NearbyGame } from "@squadup/shared";
import { fetchNearbyGames } from "../api/games.api";

type UseNearbyGamesResult = {
  games: NearbyGame[];
  loading: boolean;
  error: string | null;
};

export function useNearbyGames(
  lat: number | null | undefined,
  lng: number | null | undefined,
  radiusKm: number,
  sportId?: number,
): UseNearbyGamesResult {
  const [games, setGames] = useState<NearbyGame[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (lat == null || lng == null) {
      setGames([]);
      setLoading(false);
      setError(null);
      return;
    }

    let cancelled = false;

    setLoading(true);
    setError(null);

    fetchNearbyGames(lat, lng, radiusKm, sportId)
      .then((nearbyGames) => {
        if (!cancelled) {
          setGames(nearbyGames);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            navigator.onLine
              ? err instanceof Error
                ? err.message
                : "Failed to fetch nearby games"
              : "You're offline. Nearby games will be available when you reconnect.",
          );
          setGames([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [lat, lng, radiusKm, sportId]);

  return { games, loading, error };
}
