const AREA_GRID_SIZE = 0.05;

export function getAreaRoomKey(lat: number, lng: number): string {
  const roundedLat =
    Math.round(lat / AREA_GRID_SIZE) * AREA_GRID_SIZE;
  const roundedLng =
    Math.round(lng / AREA_GRID_SIZE) * AREA_GRID_SIZE;

  return `area-${roundedLat.toFixed(2)}-${roundedLng.toFixed(2)}`;
}
