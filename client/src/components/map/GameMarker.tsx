import L from "leaflet";
import { Marker, Popup } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import type { NearbyGame } from "@squadup/shared";
import { Button, Card } from "../ui";

type GameMarkerProps = {
  game: NearbyGame;
};

const gameIcon = L.divIcon({
  className: "",
  html: `
    <span style="
      display: block;
      width: 20px;
      height: 20px;
      border-radius: 9999px 9999px 9999px 0;
      background: #dc2626;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(15, 23, 42, 0.35);
      transform: rotate(-45deg);
    ">
      <span style="
        display: block;
        width: 6px;
        height: 6px;
        margin: 4px;
        border-radius: 9999px;
        background: white;
      "></span>
    </span>
  `,
  iconSize: [26, 26],
  iconAnchor: [13, 26],
  popupAnchor: [0, -24],
});

function formatGameTime(startTime: string) {
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

export function GameMarker({ game }: GameMarkerProps) {
  const distanceKm = game.distanceMeters / 1000;
  const navigate = useNavigate();

  return (
    <Marker position={[game.latitude, game.longitude]} icon={gameIcon}>
      <Popup className="squadup-game-popup">
        <Card className="!p-3">
          <div className="space-y-2.5">
            <p className="-mt-0.5 font-display text-lg leading-none font-bold tracking-wide text-charcoal uppercase">
              {game.sportName}
            </p>

            <p className="flex items-center gap-2 text-base text-charcoal/70">
              <span aria-hidden="true" className="text-base leading-none text-turf">📍</span>
              {game.locationName}
            </p>

            <p className="font-display text-lg font-bold text-charcoal tabular-nums">
              {game.currentPlayers} / {game.maxPlayers}
              <span className="ml-1 font-body text-sm font-medium text-charcoal/70">players</span>
            </p>

            <p className="text-[length:var(--text-caption)] text-charcoal/65">
              {formatGameTime(game.startTime)} · {distanceKm.toFixed(1)} km
            </p>

            <Button className="min-h-9 w-full px-3 py-1.5" onClick={() => navigate(`/games/${game.id}`)}>
              View Details →
            </Button>
          </div>
        </Card>
      </Popup>
    </Marker>
  );
}
