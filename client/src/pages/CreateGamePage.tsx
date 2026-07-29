import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import type { Game, Sport } from "@squadup/shared";
import { createGame } from "../api/games.api";
import { getSports } from "../api/sports.api";
import { LocationPicker } from "../components/map/LocationPicker";
import { Alert, Badge, Button, Card, EmptyState, Input, Select, formatErrorMessage } from "../components/ui";

export function CreateGamePage() {
  const navigate = useNavigate();
  const [sports, setSports] = useState<Sport[]>([]);
  const [sportId, setSportId] = useState("");
  const [locationName, setLocationName] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [minPlayers, setMinPlayers] = useState("");
  const [maxPlayers, setMaxPlayers] = useState("");
  const [startTime, setStartTime] = useState("");
  const [createdGame, setCreatedGame] = useState<Game | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getSports()
      .then(setSports)
      .catch((err) => setError(formatErrorMessage(err, "Failed to fetch sports")));
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const game = await createGame({
        sportId: Number(sportId),
        locationName,
        latitude: selectedLocation?.lat ?? 0,
        longitude: selectedLocation?.lng ?? 0,
        minPlayers: Number(minPlayers),
        maxPlayers: Number(maxPlayers),
        startTime: new Date(startTime).toISOString(),
      });
      setCreatedGame(game);
      setMessage("Your game has been created successfully!");
    } catch (err) {
      setError(formatErrorMessage(err, "Failed to create game. Please check your inputs."));
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setCreatedGame(null);
    setMessage("");
    setError("");
    setSportId("");
    setLocationName("");
    setSelectedLocation(null);
    setMinPlayers("");
    setMaxPlayers("");
    setStartTime("");
  }

  const createdSportName = sports.find((s) => s.id === createdGame?.sportId)?.name ?? "Game";

  return (
    <div className="space-y-6">
      <section className="space-y-1">
        <h1 className="font-display text-4xl leading-none font-bold text-charcoal">
          Host a Game
        </h1>
        <p className="font-body text-base text-charcoal/70">
          Pick a location on the map, fill in the game details, and invite nearby players to squad up.
        </p>
      </section>

      {message && (
        <Alert title="Game Created" variant="success">
          {message}
        </Alert>
      )}

      {error && (
        <Alert title="Creation Failed" variant="error">
          {error}
        </Alert>
      )}

      {createdGame ? (
        <Card className="space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-mist pb-4">
            <div>
              <Badge status="open">Open</Badge>
              <h2 className="mt-2 font-display text-[length:var(--text-h2)] leading-none font-bold text-charcoal">
                {createdSportName}
              </h2>
              <p className="mt-1 text-sm text-charcoal/70">📍 {createdGame.locationName}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold uppercase tracking-wider text-charcoal/50">Capacity</p>
              <p className="font-display text-2xl font-bold text-charcoal tabular-nums">
                {createdGame.currentPlayers} / {createdGame.maxPlayers}
              </p>
            </div>
          </div>

          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <p className="text-[length:var(--text-caption)] font-semibold tracking-wide text-charcoal/55 uppercase">
                Min Players Required
              </p>
              <p className="mt-0.5 font-medium text-charcoal">{createdGame.minPlayers} players</p>
            </div>
            <div>
              <p className="text-[length:var(--text-caption)] font-semibold tracking-wide text-charcoal/55 uppercase">
                Start Time
              </p>
              <p className="mt-0.5 font-medium text-charcoal">
                {new Date(createdGame.startTime).toLocaleString(undefined, {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button onClick={() => navigate(`/games/${createdGame.id}`)}>
              View Game Details →
            </Button>
            <Button variant="secondary" onClick={resetForm}>
              Host Another Game
            </Button>
          </div>
        </Card>
      ) : (
        <div className="flex flex-col gap-6 lg:flex-row lg:items-stretch">
          {/* Left Part: Map */}
          <aside className="lg:w-1/2 lg:shrink-0">
            <Card className="flex h-full flex-col !p-4">
              <div className="mb-3">
                <h2 className="font-display text-[length:var(--text-h3)] leading-none font-bold text-charcoal">
                  1. Select Location on Map
                </h2>
                <p className="mt-1.5 text-xs text-charcoal/70">
                  {selectedLocation
                    ? `📍 Selected: (${selectedLocation.lat.toFixed(4)}, ${selectedLocation.lng.toFixed(4)})`
                    : "Click anywhere on the map to set your game's pickup point."}
                </p>
              </div>
              <div className="min-h-[420px] flex-1 overflow-hidden rounded-md">
                <LocationPicker
                  onLocationSelect={(lat, lng) => setSelectedLocation({ lat, lng })}
                />
              </div>
            </Card>
          </aside>

          {/* Right Part: Form when selectedLocation exists, or EmptyState prompt when not selected */}
          <div className="min-w-0 flex-1">
            {selectedLocation ? (
              <Card className="h-full">
                <h2 className="mb-4 font-display text-[length:var(--text-h3)] leading-none font-bold text-charcoal">
                  2. Game Details
                </h2>
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <label className="block text-sm font-semibold text-charcoal">
                    Sport
                    <Select
                      className="mt-1.5"
                      value={sportId}
                      onChange={(event) => setSportId(event.target.value)}
                      required
                    >
                      <option value="">Choose a sport</option>
                      {sports.map((sport) => (
                        <option key={sport.id} value={sport.id}>
                          {sport.name}
                        </option>
                      ))}
                    </Select>
                  </label>

                  <label className="block text-sm font-semibold text-charcoal">
                    Venue / Location Name
                    <Input
                      className="mt-1.5"
                      placeholder="e.g. Central Turf Court 3"
                      value={locationName}
                      onChange={(event) => setLocationName(event.target.value)}
                      required
                    />
                  </label>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block text-sm font-semibold text-charcoal">
                      Min Players
                      <Input
                        className="mt-1.5"
                        type="number"
                        min="1"
                        placeholder="e.g. 4"
                        value={minPlayers}
                        onChange={(event) => setMinPlayers(event.target.value)}
                        required
                      />
                    </label>

                    <label className="block text-sm font-semibold text-charcoal">
                      Max Players
                      <Input
                        className="mt-1.5"
                        type="number"
                        min="1"
                        placeholder="e.g. 10"
                        value={maxPlayers}
                        onChange={(event) => setMaxPlayers(event.target.value)}
                        required
                      />
                    </label>
                  </div>

                  <label className="block text-sm font-semibold text-charcoal">
                    Start Time
                    <Input
                      className="mt-1.5"
                      type="datetime-local"
                      value={startTime}
                      onChange={(event) => setStartTime(event.target.value)}
                      required
                    />
                  </label>

                  <div className="pt-2">
                    <Button
                      className="w-full"
                      type="submit"
                      disabled={loading}
                    >
                      {loading ? "Publishing Game..." : "Create Game"}
                    </Button>
                  </div>
                </form>
              </Card>
            ) : (
              <EmptyState
                className="h-full min-h-[420px] justify-center"
                description="Click anywhere on the map on the left to select your pickup spot and open the game creation form."
                icon="📍"
                title="Select location on map"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
