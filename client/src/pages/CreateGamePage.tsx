import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { Game, Sport } from "@squadup/shared";
import { createGame } from "../api/games.api";
import { getSports } from "../api/sports.api";
import { LocationPicker } from "../components/map/LocationPicker";

export function CreateGamePage() {
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
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to fetch sports"));
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
      setMessage(`Created game ${game.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create game");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded border border-slate-200 bg-white p-4">
        <h1 className="text-xl font-semibold text-slate-950">Create Game</h1>
        <p className="mt-1 text-sm text-slate-600">Posts to the existing game creation endpoint.</p>
      </section>

      {message && <p className="rounded bg-green-50 p-3 text-sm text-green-700">{message}</p>}
      {error && <p className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <LocationPicker
        onLocationSelect={(lat, lng) => setSelectedLocation({ lat, lng })}
      />

      {selectedLocation && (
        <form className="grid gap-4 rounded border border-slate-200 bg-white p-4 md:grid-cols-2" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-slate-700">
            Sport
            <select className="mt-1 w-full rounded border border-slate-300 px-3 py-2" value={sportId} onChange={(event) => setSportId(event.target.value)} required>
              <option value="">Select sport</option>
              {sports.map((sport) => (
                <option key={sport.id} value={sport.id}>
                  {sport.name}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Location Name
            <input className="mt-1 w-full rounded border border-slate-300 px-3 py-2" value={locationName} onChange={(event) => setLocationName(event.target.value)} required />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Min Players
            <input className="mt-1 w-full rounded border border-slate-300 px-3 py-2" type="number" min="1" value={minPlayers} onChange={(event) => setMinPlayers(event.target.value)} required />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Max Players
            <input className="mt-1 w-full rounded border border-slate-300 px-3 py-2" type="number" min="1" value={maxPlayers} onChange={(event) => setMaxPlayers(event.target.value)} required />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Start Time
            <input className="mt-1 w-full rounded border border-slate-300 px-3 py-2" type="datetime-local" value={startTime} onChange={(event) => setStartTime(event.target.value)} required />
          </label>
          <div className="md:col-span-2">
            <button className="rounded bg-slate-950 px-4 py-2 text-sm font-medium text-white disabled:opacity-60" disabled={loading}>
              Create Game
            </button>
          </div>
        </form>
      )}

      {createdGame && (
        <pre className="overflow-auto rounded border border-slate-200 bg-slate-50 p-4 text-sm">
          {JSON.stringify(createdGame, null, 2)}
        </pre>
      )}
    </div>
  );
}
