import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { Game } from "@squadup/shared";
import { getGames } from "../api/games.api";

export function GamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getGames()
      .then(setGames)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to fetch games"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <section className="rounded border border-slate-200 bg-white p-4">
        <h1 className="text-xl font-semibold text-slate-950">Games</h1>
        <p className="mt-1 text-sm text-slate-600">Fetched from the existing games endpoint.</p>
      </section>

      {loading && <p className="text-sm text-slate-600">Loading games...</p>}
      {error && <p className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {games.map((game) => (
          <article key={game.id} className="space-y-3 rounded border border-slate-200 bg-white p-4">
            <div>
              <p className="text-sm font-medium text-slate-500">Sport #{game.sportId}</p>
              <h2 className="text-lg font-semibold text-slate-950">{game.locationName}</h2>
            </div>
            <dl className="space-y-1 text-sm text-slate-700">
              <div className="flex justify-between gap-4">
                <dt>Players</dt>
                <dd>{game.currentPlayers}/{game.maxPlayers}</dd>
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
            <Link className="inline-flex rounded border border-slate-300 px-3 py-2 text-sm font-medium text-slate-950" to={`/games/${game.id}`}>
              View Details
            </Link>
          </article>
        ))}
      </div>

      {!loading && !error && games.length === 0 && (
        <p className="rounded border border-slate-200 bg-white p-4 text-sm text-slate-600">No games found.</p>
      )}
    </div>
  );
}
