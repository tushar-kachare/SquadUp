import L from "leaflet";
import { Marker, Popup } from "react-leaflet";
import type { NearbyGame } from "@squadup/shared";

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

export function GameMarker({ game }: GameMarkerProps) {
  const distanceKm = game.distanceMeters / 1000;

  return (
    <Marker position={[game.latitude, game.longitude]} icon={gameIcon}>
      <Popup>
        <div className="space-y-1">
          <p className="font-semibold text-slate-950">{game.sportName}</p>
          <p>{game.locationName}</p>
          <p>
            {game.currentPlayers}/{game.maxPlayers} players
          </p>
          <p>{new Date(game.startTime).toLocaleString()}</p>
          <p>{distanceKm.toFixed(1)} km away</p>
        </div>
      </Popup>
    </Marker>
  );
}
