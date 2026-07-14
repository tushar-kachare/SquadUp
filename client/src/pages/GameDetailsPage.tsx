import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Marker } from "react-leaflet";
import { Link, useParams } from "react-router-dom";
import type { Game, GameParticipant, Sport } from "@squadup/shared";
import { cancelGame, getGame, joinGame, leaveGame } from "../api/games.api";
import { getGameParticipants } from "../api/gameParticipants.api";
import { getSports } from "../api/sports.api";
import { GameMap } from "../components/map/GameMap";
import { Badge, Button, Card } from "../components/ui";
import { useAuth } from "../hooks/useAuth";

function formatStartTime(startTime: string) {
  const startDate = new Date(startTime);
  const today = new Date();
  const isToday = startDate.toDateString() === today.toDateString();
  const dateLabel = isToday
    ? "Today"
    : startDate.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  const timeLabel = startDate.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });

  return `${dateLabel}, ${timeLabel}`;
}

function formatRelativeTime(createdAt: string) {
  const minutesAgo = Math.max(0, Math.floor((Date.now() - new Date(createdAt).getTime()) / 60_000));

  if (minutesAgo < 1) return "Created just now";
  if (minutesAgo < 60) return `Created ${minutesAgo} minute${minutesAgo === 1 ? "" : "s"} ago`;

  const hoursAgo = Math.floor(minutesAgo / 60);
  if (hoursAgo < 24) return `Created ${hoursAgo} hour${hoursAgo === 1 ? "" : "s"} ago`;

  const daysAgo = Math.floor(hoursAgo / 24);
  return `Created ${daysAgo} day${daysAgo === 1 ? "" : "s"} ago`;
}

export function GameDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [game, setGame] = useState<Game | null>(null);
  const [participants, setParticipants] = useState<GameParticipant[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();

  const sport = useMemo(
    () => sports.find((item) => item.id === game?.sportId),
    [game?.sportId, sports],
  );
  const currentParticipant =
    participants.find(
      (participant) => user?.email && participant.user.email === user.email,
    ) ??
    participants.find(
      (participant) =>
        user?.displayName && participant.user.displayName === user.displayName,
    );
  const isParticipant = currentParticipant !== undefined;
  const isCreator = currentParticipant?.userId === game?.creatorId;

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
      await joinGame(id);
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
      await cancelGame(id);
      await refreshGame(id);
      setMessage("Cancelled game");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel game");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLeave(event: FormEvent) {
    event.preventDefault();
    if (!id) return;

    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      await leaveGame(id);
      await refreshGame(id);
      setMessage("Left game");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to leave game");
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
      <Link className="text-sm font-semibold text-turf underline underline-offset-4" to="/games">Back to games</Link>

      {message && <p className="rounded border border-turf/20 bg-turf/10 p-3 text-sm text-turf">{message}</p>}
      {error && <p className="rounded border border-court-red/20 bg-court-red/10 p-3 text-sm text-court-red">{error}</p>}

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="space-y-4 lg:col-span-2">
          <Card>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-display text-[length:var(--text-h2)] leading-none font-bold text-charcoal">
                  {sport?.name ?? "Sport"}
                </p>
                <p className="mt-3 text-base text-charcoal/70">📍 {game.locationName}</p>
              </div>
              <Badge status={game.status}>{game.status}</Badge>
            </div>

            <p className="mt-6 font-display text-[length:var(--text-h2)] leading-none font-bold text-charcoal tabular-nums">
              {game.currentPlayers} / {game.maxPlayers}
              <span className="ml-2 font-body text-base font-medium text-charcoal/70">players</span>
            </p>

            <div className="mt-6 grid gap-3 border-t border-mist pt-5 text-sm sm:grid-cols-2">
              <div>
                <p className="text-[length:var(--text-caption)] font-semibold tracking-wide text-charcoal/55 uppercase">Starts</p>
                <p className="mt-1 font-medium text-charcoal">{formatStartTime(game.startTime)}</p>
              </div>
              <div>
                <p className="text-[length:var(--text-caption)] font-semibold tracking-wide text-charcoal/55 uppercase">Posted</p>
                <p className="mt-1 font-medium text-charcoal">{formatRelativeTime(game.createdAt)}</p>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="font-display text-[length:var(--text-h3)] leading-none font-bold text-charcoal">Participants</h2>
            {participants.length === 0 ? (
              <p className="mt-3 text-sm text-charcoal/65">No participants found.</p>
            ) : (
              <ul className="mt-4 divide-y divide-mist">
                {participants.map((participant) => (
                  <li key={participant.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                    <span className="text-sm font-medium text-charcoal">{participant.user.displayName}</span>
                    {participant.userId === game.creatorId && <Badge status="muted">Creator</Badge>}
                  </li>
                ))}
              </ul>
            )}
          </Card>

          {(game.status === "open" && !isParticipant) || (isParticipant && !isCreator) || isCreator ? (
            <Card>
              <div className="flex flex-wrap gap-3">
                {game.status === "open" && !isParticipant && (
                  <form onSubmit={handleJoin}>
                    <Button disabled={submitting} type="submit">Join Game</Button>
                  </form>
                )}
                {isParticipant && !isCreator && (
                  <form onSubmit={handleLeave}>
                    <Button disabled={submitting} type="submit" variant="secondary">Leave Game</Button>
                  </form>
                )}
                {isCreator && (
                  <form onSubmit={handleCancel}>
                    <Button disabled={submitting} type="submit" variant="danger">Cancel Game</Button>
                  </form>
                )}
              </div>
            </Card>
          ) : null}
        </section>

        <aside>
          <Card className="overflow-hidden !p-0">
            <GameMap center={[game.latitude, game.longitude]} zoom={15} style={{ height: "180px" }}>
              <Marker position={[game.latitude, game.longitude]} />
            </GameMap>
            <div className="p-4">
              <a
                className="inline-flex min-h-10 w-full items-center justify-center rounded-md border border-turf bg-turf px-4 py-2 text-sm font-semibold tracking-[0.01em] text-chalk transition-colors hover:bg-turf/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-turf"
                href={`https://www.google.com/maps/dir/?api=1&destination=${game.latitude},${game.longitude}`}
                rel="noreferrer"
                target="_blank"
              >
                Get Directions
              </a>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
}
