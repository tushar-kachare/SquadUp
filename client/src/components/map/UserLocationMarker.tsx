import { Marker, Popup } from "react-leaflet";

type UserLocationMarkerProps = {
  position: [number, number];
};

export function UserLocationMarker({ position }: UserLocationMarkerProps) {
  return (
    <Marker position={position}>
      <Popup>You are here</Popup>
    </Marker>
  );
}
