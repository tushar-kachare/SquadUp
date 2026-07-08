import { useState } from "react";
import L from "leaflet";
import { Marker, Popup, useMapEvents } from "react-leaflet";
import { GameMap } from "./GameMap";
import { UserLocationMarker } from "./UserLocationMarker";
import { useGeolocation } from "../../hooks/useGeolocation";

type LocationPickerProps = {
  onLocationSelect: (lat: number, lng: number) => void;
};

type SelectedLocation = {
  lat: number;
  lng: number;
};

const selectedLocationIcon = L.divIcon({
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

function ClickHandler({
  onSelect,
}: {
  onSelect: (location: SelectedLocation) => void;
}) {
  useMapEvents({
    click(event) {
      onSelect({
        lat: event.latlng.lat,
        lng: event.latlng.lng,
      });
    },
  });

  return null;
}

export function LocationPicker({ onLocationSelect }: LocationPickerProps) {
  const { position } = useGeolocation();
  const [selectedLocation, setSelectedLocation] =
    useState<SelectedLocation | null>(null);

  function handleSelect(location: SelectedLocation) {
    setSelectedLocation(location);
    onLocationSelect(location.lat, location.lng);
  }

  return (
    <GameMap
      key={position ? `${position.lat}-${position.lng}` : "default"}
      center={position ? [position.lat, position.lng] : undefined}
    >
      <ClickHandler onSelect={handleSelect} />
      {position && <UserLocationMarker position={[position.lat, position.lng]} />}
      {selectedLocation && (
        <Marker
          position={[selectedLocation.lat, selectedLocation.lng]}
          icon={selectedLocationIcon}
        >
          <Popup>Game location</Popup>
        </Marker>
      )}
    </GameMap>
  );
}
