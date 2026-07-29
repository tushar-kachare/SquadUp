import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import type {
  Game,
  NearbyGame,
  NewGameCreatedEvent,
  SlotUpdatedEvent,
  Sport,
} from "@squadup/shared";
import { getGame, getGames } from "../api/games.api";
import { getSports } from "../api/sports.api";
import { GameMarker } from "../components/map/GameMarker";
import { GameMap } from "../components/map/GameMap";
import { MapFilters } from "../components/map/MapFilters";
import { RadiusCircle } from "../components/map/RadiusCircle";
import { UserLocationMarker } from "../components/map/UserLocationMarker";
import { Alert, Badge, Button, Card, CardSkeleton, EmptyState, formatErrorMessage } from "../components/ui";
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
  const [selectedSportIds, setSelectedSportIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const {
    position,
    loading: locationLoading,
    error: locationError,
  } = useGeolocation();
  const {
    games: nearbyGames,
    loading: nearbyLoading,
    error: nearbyGamesError,
  } = useNearbyGames(
    position?.lat,
    position?.lng,
    radiusKm,
  );
  const isPageLoading = loading || locationLoading || nearbyLoading;
  const filteredNearbyGames =
    selectedSportIds.length === 0
      ? visibleNearbyGames
      : visibleNearbyGames.filter((game) =>
          selectedSportIds.includes(game.sportId),
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
  const fullRoomIds = useRef(new Set<string>());
  const gamesRef = useRef<Game[]>([]);
  const visibleNearbyGamesRef = useRef<NearbyGame[]>([]);

  useEffect(() => {
    gamesRef.current = games;
  }, [games]);

  useEffect(() => {
    visibleNearbyGamesRef.current = visibleNearbyGames;
  }, [visibleNearbyGames]);

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

      for (const gameId of fullRoomIds.current) {
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
        if (event.status !== "open") {
          setGames((currentGames) =>
            currentGames.filter((game) => game.id !== event.gameId),
          );
          setVisibleNearbyGames((currentGames) =>
            currentGames.filter((game) => game.id !== event.gameId),
          );
          visibleGameIds.current.delete(event.gameId);

          if (event.status === "full") {
            fullRoomIds.current.add(event.gameId);
            return;
          }

          fullRoomIds.current.delete(event.gameId);

          if (joinedRoomIds.current.has(event.gameId)) {
            leaveGameRoom(event.gameId);
            joinedRoomIds.current.delete(event.gameId);
          }

          return;
        }

        fullRoomIds.current.delete(event.gameId);

        const cachedGame = gamesRef.current.find(
          (game) => game.id === event.gameId,
        );
        const cachedNearbyGame = visibleNearbyGamesRef.current.find(
          (game) => game.id === event.gameId,
        );

        if (cachedGame) {
          setGames((currentGames) =>
            currentGames.some((game) => game.id === event.gameId)
              ? currentGames.map((game) =>
                  game.id === event.gameId
                    ? {
                        ...game,
                        currentPlayers: event.currentPlayers,
                        status: event.status,
                      }
                    : game,
                )
              : [
                  {
                    ...cachedGame,
                    currentPlayers: event.currentPlayers,
                    status: event.status,
                  },
                  ...currentGames,
                ],
          );
        }

        if (cachedNearbyGame) {
          setVisibleNearbyGames((currentGames) =>
            currentGames.some((game) => game.id === event.gameId)
              ? currentGames.map((game) =>
                  game.id === event.gameId
                    ? {
                        ...game,
                        currentPlayers: event.currentPlayers,
                        status: event.status,
                      }
                    : game,
                )
              : [
                  {
                    ...cachedNearbyGame,
                    currentPlayers: event.currentPlayers,
                    status: event.status,
                  },
                  ...currentGames,
                ],
          );
          visibleGameIds.current.add(event.gameId);
          return;
        }

        void getGame(event.gameId)
          .then((freshGame) => {
            setGames((currentGames) =>
              currentGames.some((game) => game.id === freshGame.id)
                ? currentGames.map((game) =>
                    game.id === freshGame.id ? freshGame : game,
                  )
                : [freshGame, ...currentGames],
            );

            if (!position) {
              return;
            }

            const distanceMeters = getDistanceMeters(position, {
              lat: freshGame.latitude,
              lng: freshGame.longitude,
            });

            if (
              distanceMeters > radiusKm * 1000
            ) {
              return;
            }

            const sportName =
              sports.find((sport) => sport.id === freshGame.sportId)?.name ??
              `Sport #${freshGame.sportId}`;
            const nearbyGame: NearbyGame = {
              ...freshGame,
              sportName,
              distanceMeters,
            };

            setVisibleNearbyGames((currentGames) =>
              currentGames.some((game) => game.id === nearbyGame.id)
                ? currentGames.map((game) =>
                    game.id === nearbyGame.id ? nearbyGame : game,
                  )
                : [...currentGames, nearbyGame],
            );
            visibleGameIds.current.add(freshGame.id);
          })
          .catch((err) =>
            setError(
              formatErrorMessage(err, "Failed to refresh game details."),
            ),
          );

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
    [leaveGameRoom, onSlotUpdated, position, radiusKm, sports],
  );

  useEffect(() => {
    if (!socket?.connected) {
      return;
    }

    const nextRoomIds = new Set(nearbyGames.map((game) => game.id));

    for (const gameId of joinedRoomIds.current) {
      if (!nextRoomIds.has(gameId)) {
        if (fullRoomIds.current.has(gameId)) {
          continue;
        }

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
          distanceMeters > radiusKm * 1000
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
    sports,
  ]);

  useEffect(() => {
    getGames()
      .then(setGames)
      .catch((err) =>
        setError(formatErrorMessage(err, "Failed to fetch games.")),
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    getSports()
      .then(setSports)
      .catch((err) =>
        setError(formatErrorMessage(err, "Failed to fetch sports.")),
      );
  }, []);

  return (
    <div className="space-y-6">
      <section className="space-y-1">
        <h1 className="font-display text-4xl leading-none font-bold text-charcoal">
          Find Games Nearby
        </h1>
        <p className="font-body text-base text-charcoal/70">
          Discover pickup games around you, filter by sport or distance, and jump right into the action.
        </p>
      </section>

      {error && <Alert variant="error">{error}</Alert>}
      {locationLoading && (
        <Alert title="Locating..." variant="info">
          Detecting your GPS position for nearby games...
        </Alert>
      )}
      {locationError && (
        <Alert title="Location Access" variant="warning">
          {locationError}
        </Alert>
      )}
      {nearbyGamesError && !navigator.onLine && (
        <Alert variant="warning">{nearbyGamesError}</Alert>
      )}

      <section className="flex flex-col gap-4 lg:flex-row lg:items-stretch">
        <aside className="lg:flex lg:w-[38%] lg:shrink-0">
          <MapFilters
            radiusKm={radiusKm}
            onRadiusChange={setRadiusKm}
            selectedSportIds={selectedSportIds}
            onSelectedSportsChange={setSelectedSportIds}
            sports={sports}
            resultCount={filteredNearbyGames.length}
            loading={isPageLoading}
          />
        </aside>
        <div className="min-w-0 flex-1">
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
            {filteredNearbyGames.map((game) => (
              <GameMarker key={game.id} game={game} />
            ))}
          </GameMap>
        </div>
      </section>

      {isPageLoading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : filteredNearbyGames.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredNearbyGames.map((game) => (
            <Card key={game.id} className="flex flex-col justify-between gap-4 !p-5">
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-display text-xl leading-none font-bold tracking-wide text-charcoal uppercase">
                    {game.sportName}
                  </h3>
                  <Badge status={game.status}>{game.status}</Badge>
                </div>
                <div>
                  <p className="text-sm text-charcoal/70">📍 {game.locationName}</p>
                  <p className="mt-2 font-display text-2xl font-bold text-charcoal tabular-nums">
                    {game.currentPlayers} / {game.maxPlayers}
                    <span className="ml-1.5 font-body text-sm font-medium text-charcoal/70">players</span>
                  </p>
                  <p className="mt-2 text-[length:var(--text-caption)] text-charcoal/65">
                    {new Date(game.startTime).toLocaleString(undefined, {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })} · {(game.distanceMeters / 1000).toFixed(1)} km away
                  </p>
                </div>
              </div>
              <Button className="mt-2 w-full" onClick={() => navigate(`/games/${game.id}`)}>
                View Details →
              </Button>
            </Card>
          ))}
        </div>
      ) : !error ? (
        <EmptyState
          action={
            selectedSportIds.length > 0 || radiusKm < 10 ? (
              <Button
                variant="secondary"
                onClick={() => {
                  setSelectedSportIds([]);
                  setRadiusKm(10);
                }}
              >
                Clear Filters
              </Button>
            ) : undefined
          }
          description="No nearby games match your current filter criteria. Try expanding your search radius or clearing sport filters."
          icon="🔍"
          title="No games found nearby"
        />
      ) : null}
    </div>
  );
}
