import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Game, Sport } from "@squadup/shared";
import { getGames } from "../api/games.api";
import { getSports } from "../api/sports.api";
import { GameMarker } from "../components/map/GameMarker";
import { GameMap } from "../components/map/GameMap";
import { MapFilters } from "../components/map/MapFilters";
import { RadiusCircle } from "../components/map/RadiusCircle";
import { UserLocationMarker } from "../components/map/UserLocationMarker";
import { useGeolocation } from "../hooks/useGeolocation";
import { useNearbyGames } from "../hooks/useNearbyGames";

export function GamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [radiusKm, setRadiusKm] = useState(5);
  const [sportId, setSportId] = useState<number | undefined>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const {
    position,
    loading: locationLoading,
    error: locationError,
  } = useGeolocation();
  const { games: nearbyGames } = useNearbyGames(
    position?.lat,
    position?.lng,
    radiusKm,
    sportId,
  );

  useEffect(() => {
    getGames()
      .then(setGames)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to fetch games"),
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    getSports()
      .then(setSports)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to fetch sports"),
      );
  }, []);

  return (
    <div className="space-y-6">
      <section className="rounded border border-slate-200 bg-white p-4">
        <h1 className="text-xl font-semibold text-slate-950">Games</h1>
        <p className="mt-1 text-sm text-slate-600">
          Fetched from the existing games endpoint.
        </p>
      </section>

      {loading && <p className="text-sm text-slate-600">Loading games...</p>}
      {error && (
        <p className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>
      )}
      {locationLoading && (
        <p className="text-sm text-slate-600">Checking your location...</p>
      )}
      {locationError && (
        <p className="rounded bg-yellow-50 p-3 text-sm text-yellow-800">
          {locationError}
        </p>
      )}
      <MapFilters
        radiusKm={radiusKm}
        onRadiusChange={setRadiusKm}
        sportId={sportId}
        onSportChange={setSportId}
        sports={sports}
      />
      <GameMap
        key={position ? `${position.lat}-${position.lng}` : "default"}
        center={position ? [position.lat, position.lng] : undefined}
      >
        {position && (
          <>
            <RadiusCircle
              center={[position.lat, position.lng]}
              radiusKm={radiusKm}
            />
            <UserLocationMarker position={[position.lat, position.lng]} />
          </>
        )}
        {nearbyGames.map((game) => (
          <GameMarker key={game.id} game={game} />
        ))}
      </GameMap>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {games.map((game) => (
          <article
            key={game.id}
            className="space-y-3 rounded border border-slate-200 bg-white p-4"
          >
            <div>
              <p className="text-sm font-medium text-slate-500">
                Sport #{game.sportId}
              </p>
              <h2 className="text-lg font-semibold text-slate-950">
                {game.locationName}
              </h2>
            </div>
            <dl className="space-y-1 text-sm text-slate-700">
              <div className="flex justify-between gap-4">
                <dt>Players</dt>
                <dd>
                  {game.currentPlayers}/{game.maxPlayers}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Status</dt>
                <dd>{game.status}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Start</dt>
                <dd>{new Date(game.startTime).toLocaleString()}</dd>
              </div>
            </dl>
            <Link
              className="inline-flex rounded border border-slate-300 px-3 py-2 text-sm font-medium text-slate-950"
              to={`/games/${game.id}`}
            >
              View Details
            </Link>
          </article>
        ))}
      </div>

      {!loading && !error && games.length === 0 && (
        <p className="rounded border border-slate-200 bg-white p-4 text-sm text-slate-600">
          No games found.
        </p>
      )}
    </div>
  );
}
