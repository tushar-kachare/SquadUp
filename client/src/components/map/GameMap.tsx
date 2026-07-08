import { MapContainer, TileLayer } from "react-leaflet";
import L from "leaflet";
import type { CSSProperties, ReactNode } from "react";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

type GameMapProps = {
  center?: [number, number];
  zoom?: number;
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
};

const defaultCenter: [number, number] = [18.53056, 73.85679];
const defaultStyle: CSSProperties = {
  height: "500px",
  width: "100%",
};

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

L.Marker.prototype.options.icon = L.icon({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});

export function GameMap({
  center = defaultCenter,
  zoom = 15,
  className,
  style,
  children,
}: GameMapProps) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className={className}
      style={{ ...defaultStyle, ...style }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {children}
    </MapContainer>
  );
}
