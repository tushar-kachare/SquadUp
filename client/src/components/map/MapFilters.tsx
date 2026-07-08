import type { Sport } from "@squadup/shared";

type MapFiltersProps = {
  radiusKm: number;
  onRadiusChange: (km: number) => void;
  sportId: number | undefined;
  onSportChange: (id: number | undefined) => void;
  sports: Sport[];
};

export function MapFilters({
  radiusKm,
  onRadiusChange,
  sportId,
  onSportChange,
  sports,
}: MapFiltersProps) {
  return (
    <div className="grid gap-4 rounded border border-slate-200 bg-white p-4 md:grid-cols-2">
      <label className="block text-sm font-medium text-slate-700">
        Radius: {radiusKm} km
        <input
          className="mt-2 w-full"
          type="range"
          min="1"
          max="10"
          step="1"
          value={radiusKm}
          onChange={(event) => onRadiusChange(Number(event.target.value))}
        />
      </label>

      <label className="block text-sm font-medium text-slate-700">
        Sport
        <select
          className="mt-1 w-full rounded border border-slate-300 px-3 py-2"
          value={sportId ?? ""}
          onChange={(event) =>
            onSportChange(
              event.target.value ? Number(event.target.value) : undefined,
            )
          }
        >
          <option value="">All sports</option>
          {sports.map((sport) => (
            <option key={sport.id} value={sport.id}>
              {sport.name}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
