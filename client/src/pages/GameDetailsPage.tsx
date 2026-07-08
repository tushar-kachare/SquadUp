import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import type { Game, GameParticipant, Sport } from "@squadup/shared";
import { cancelGame, getGame, joinGame } from "../api/games.api";
import { getGameParticipants } from "../api/gameParticipants.api";
import { getSports } from "../api/sports.api";

export function GameDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [game, setGame] = useState<Game | null>(null);
  const [participants, setParticipants] = useState<GameParticipant[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [joinUserId, setJoinUserId] = useState("");
  const [cancelUserId, setCancelUserId] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const sport = useMemo(
    () => sports.find((item) => item.id === game?.sportId),
    [game?.sportId, sports],
  );

  async function refreshGame(gameId: string) {
    const [freshGame, freshParticipants] = await Promise.all([
      getGame(gameId),
      getGameParticipants(gameId),
    ]);
    setGame(freshGame);
    setParticipants(freshParticipants);
  }

  useEffect(() => {
    if (!id) {
      setError("Game ID is required");
      setLoading(false);
      return;
    }

    Promise.all([getGame(id), getSports(), getGameParticipants(id)])
      .then(([freshGame, freshSports, freshParticipants]) => {
        setGame(freshGame);
        setSports(freshSports);
        setParticipants(freshParticipants);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to fetch game"))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleJoin(event: FormEvent) {
    event.preventDefault();
    if (!id) return;

    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      await joinGame(id, joinUserId);
      await refreshGame(id);
      setMessage("Joined game");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to join game");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCancel(event: FormEvent) {
    event.preventDefault();
    if (!id) return;

    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      await cancelGame(id, cancelUserId);
      await refreshGame(id);
      setMessage("Cancelled game");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel game");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-slate-600">Loading game...</p>;
  }

  if (!game) {
    return (
      <div className="space-y-4">
        {error && <p className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <Link className="text-sm font-medium text-slate-950 underline" to="/games">Back to games</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link className="text-sm font-medium text-slate-950 underline" to="/games">Back to games</Link>

      <section className="rounded border border-slate-200 bg-white p-4">
        <p className="text-sm font-medium text-slate-500">{sport ? sport.name : `Sport #${game.sportId}`}</p>
        <h1 className="text-xl font-semibold text-slate-950">{game.locationName}</h1>
      </section>

      {message && <p className="rounded bg-green-50 p-3 text-sm text-green-700">{message}</p>}
      {error && <p className="rounded bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <dl className="grid gap-3 rounded border border-slate-200 bg-white p-4 text-sm md:grid-cols-2">
        <div><dt className="font-medium text-slate-500">Game ID</dt><dd className="break-all text-slate-950">{game.id}</dd></div>
        <div><dt className="font-medium text-slate-500">Creator ID</dt><dd className="break-all text-slate-950">{game.creatorId}</dd></div>
        <div><dt className="font-medium text-slate-500">Coordinates</dt><dd className="text-slate-950">{game.latitude}, {game.longitude}</dd></div>
        <div><dt className="font-medium text-slate-500">Players</dt><dd className="text-slate-950">{game.currentPlayers}/{game.maxPlayers}</dd></div>
        <div><dt className="font-medium text-slate-500">Status</dt><dd className="text-slate-950">{game.status}</dd></div>
        <div><dt className="font-medium text-slate-500">Created</dt><dd className="text-slate-950">{new Date(game.createdAt).toLocaleString()}</dd></div>
        <div><dt className="font-medium text-slate-500">Start</dt><dd className="text-slate-950">{new Date(game.startTime).toLocaleString()}</dd></div>
      </dl>

      <section className="rounded border border-slate-200 bg-white p-4">
        <h2 className="font-semibold text-slate-950">Participants</h2>
        {participants.length === 0 ? (
          <p className="mt-3 text-sm text-slate-600">No participants found.</p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-slate-500">
                <tr>
                  <th className="py-2 pr-4 font-medium">Name</th>
                  <th className="py-2 pr-4 font-medium">User ID</th>
                  <th className="py-2 pr-4 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {participants.map((participant) => (
                  <tr key={participant.id} className="border-b border-slate-100 last:border-0">
                    <td className="py-2 pr-4 text-slate-950">{participant.user.displayName}</td>
                    <td className="break-all py-2 pr-4 text-slate-700">{participant.userId}</td>
                    <td className="py-2 pr-4 text-slate-700">{new Date(participant.joinedAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <form className="space-y-4 rounded border border-slate-200 bg-white p-4" onSubmit={handleJoin}>
          <h2 className="font-semibold text-slate-950">Join Game</h2>
          <label className="block text-sm font-medium text-slate-700">
            User ID
            <input className="mt-1 w-full rounded border border-slate-300 px-3 py-2" value={joinUserId} onChange={(event) => setJoinUserId(event.target.value)} required />
          </label>
          <button className="rounded bg-slate-950 px-4 py-2 text-sm font-medium text-white disabled:opacity-60" disabled={submitting}>
            Join Game
          </button>
        </form>

        <form className="space-y-4 rounded border border-slate-200 bg-white p-4" onSubmit={handleCancel}>
          <h2 className="font-semibold text-slate-950">Cancel Game</h2>
          <label className="block text-sm font-medium text-slate-700">
            Creator ID
            <input className="mt-1 w-full rounded border border-slate-300 px-3 py-2" value={cancelUserId} onChange={(event) => setCancelUserId(event.target.value)} required />
          </label>
          <button className="rounded bg-red-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-60" disabled={submitting}>
            Cancel Game
          </button>
        </form>
      </div>
    </div>
  );
}
