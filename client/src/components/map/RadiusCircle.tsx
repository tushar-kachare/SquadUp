import { Circle } from "react-leaflet";

type RadiusCircleProps = {
  center: [number, number];
  radiusKm: number;
};

export function RadiusCircle({ center, radiusKm }: RadiusCircleProps) {
  return (
    <Circle
      center={center}
      radius={radiusKm * 1000}
      pathOptions={{
        color: "#2563eb",
        fillColor: "#3b82f6",
        fillOpacity: 0.08,
        opacity: 0.35,
        weight: 2,
      }}
    />
  );
}
