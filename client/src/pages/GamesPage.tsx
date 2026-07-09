import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type {
  Game,
  NearbyGame,
  NewGameCreatedEvent,
  SlotUpdatedEvent,
  Sport,
} from "@squadup/shared";
import { getGames } from "../api/games.api";
import { getSports } from "../api/sports.api";
import { GameMarker } from "../components/map/GameMarker";
import { GameMap } from "../components/map/GameMap";
import { MapFilters } from "../components/map/MapFilters";
import { RadiusCircle } from "../components/map/RadiusCircle";
import { UserLocationMarker } from "../components/map/UserLocationMarker";
import { useGeolocation } from "../hooks/useGeolocation";
import { useNearbyGames } from "../hooks/useNearbyGames";
import { useSocket } from "../hooks/useSocket";

function getDistanceMeters(
  first: { lat: number; lng: number },
  second: { lat: number; lng: number },
) {
  const earthRadiusMeters = 6_371_000;
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const latDelta = toRadians(second.lat - first.lat);
  const lngDelta = toRadians(second.lng - first.lng);
  const firstLat = toRadians(first.lat);
  const secondLat = toRadians(second.lat);
  const haversine =
    Math.sin(latDelta / 2) ** 2 +
    Math.cos(firstLat) *
      Math.cos(secondLat) *
      Math.sin(lngDelta / 2) ** 2;

  return (
    2 *
    earthRadiusMeters *
    Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))
  );
}

export function GamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [visibleNearbyGames, setVisibleNearbyGames] = useState<NearbyGame[]>([]);
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
  const {
    socket,
    joinGameRoom,
    leaveGameRoom,
    joinAreaRoom,
    leaveAreaRoom,
    onSlotUpdated,
    onNewGameCreated,
  } = useSocket();
  const joinedRoomIds = useRef(new Set<string>());
  const visibleGameIds = useRef(new Set<string>());

  useEffect(() => {
    setVisibleNearbyGames(nearbyGames);
    visibleGameIds.current = new Set(nearbyGames.map((game) => game.id));
  }, [nearbyGames]);

  useEffect(() => {
    if (!socket) {
      return;
    }

    const joinVisibleRooms = () => {
      joinedRoomIds.current.clear();

      for (const gameId of visibleGameIds.current) {
        joinGameRoom(gameId);
        joinedRoomIds.current.add(gameId);
      }
    };

    const clearJoinedRooms = () => {
      joinedRoomIds.current.clear();
    };

    socket.on("connect", joinVisibleRooms);
    socket.on("disconnect", clearJoinedRooms);

    if (socket.connected) {
      joinVisibleRooms();
    }

    return () => {
      socket.off("connect", joinVisibleRooms);
      socket.off("disconnect", clearJoinedRooms);
      joinedRoomIds.current.clear();
    };
  }, [joinGameRoom, socket]);

  useEffect(
    () =>
      onSlotUpdated((event: SlotUpdatedEvent) => {
        setVisibleNearbyGames((currentGames) =>
          currentGames.map((game) =>
            game.id === event.gameId
              ? {
                  ...game,
                  currentPlayers: event.currentPlayers,
                  status: event.status,
                }
              : game,
          ),
        );
      }),
    [onSlotUpdated],
  );

  useEffect(() => {
    if (!socket?.connected) {
      return;
    }

    const nextRoomIds = new Set(nearbyGames.map((game) => game.id));

    for (const gameId of joinedRoomIds.current) {
      if (!nextRoomIds.has(gameId)) {
        leaveGameRoom(gameId);
        joinedRoomIds.current.delete(gameId);
      }
    }

    for (const gameId of nextRoomIds) {
      if (!joinedRoomIds.current.has(gameId)) {
        joinGameRoom(gameId);
        joinedRoomIds.current.add(gameId);
      }
    }
  }, [joinGameRoom, leaveGameRoom, nearbyGames, socket]);

  useEffect(() => {
    if (!position || !socket) {
      return;
    }

    const { lat, lng } = position;
    const joinCurrentArea = () => joinAreaRoom(lat, lng);
    const unsubscribe = onNewGameCreated(
      (createdGame: NewGameCreatedEvent) => {
        const distanceMeters = getDistanceMeters(position, {
          lat: createdGame.latitude,
          lng: createdGame.longitude,
        });

        if (
          distanceMeters > radiusKm * 1000 ||
          (sportId !== undefined && createdGame.sportId !== sportId)
        ) {
          return;
        }

        const sportName =
          sports.find((sport) => sport.id === createdGame.sportId)?.name ??
          `Sport #${createdGame.sportId}`;
        const nearbyGame: NearbyGame = {
          ...createdGame,
          sportName,
          distanceMeters,
        };

        setGames((currentGames) =>
          currentGames.some((game) => game.id === createdGame.id)
            ? currentGames
            : [createdGame, ...currentGames],
        );
        setVisibleNearbyGames((currentGames) =>
          currentGames.some((game) => game.id === createdGame.id)
            ? currentGames
            : [...currentGames, nearbyGame],
        );
        visibleGameIds.current.add(createdGame.id);
        joinGameRoom(createdGame.id);
        joinedRoomIds.current.add(createdGame.id);
      },
    );

    socket.on("connect", joinCurrentArea);

    if (socket.connected) {
      joinCurrentArea();
    }

    return () => {
      socket.off("connect", joinCurrentArea);
      leaveAreaRoom(lat, lng);
      unsubscribe();
    };
  }, [
    joinAreaRoom,
    joinGameRoom,
    leaveAreaRoom,
    onNewGameCreated,
    position,
    radiusKm,
    socket,
    sportId,
    sports,
  ]);

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
        {visibleNearbyGames.map((game) => (
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
